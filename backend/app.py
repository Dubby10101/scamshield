from flask import Flask, request, jsonify
import requests
import json
import os
import re
import time
from datetime import datetime
from bs4 import BeautifulSoup
import ssl
import socket
import whois
import urllib.parse
from models import db, User, URLSubmission
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all routes with any origin

# DeepSeek AI API configuration
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY', 'sk-283d2bc0283e46aab8a42b31037a9d87')
DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

# Known phishing patterns and suspicious keywords
SUSPICIOUS_KEYWORDS = [
    'login', 'password', 'credit card', 'bank account', 'verify', 'confirm', 
    'update', 'secure', 'alert', 'urgent', 'suspended', 'limited', 'access', 
    'lottery', 'winner', 'prize', 'free', 'gift', 'bonus', 'investment', 
    'bitcoin', 'crypto', 'wallet', 'payment', 'paypal', 'apple', 'microsoft', 
    'google', 'facebook', 'amazon', 'netflix', 'support', 'help', 'customer service'
]

# Known scam TLDs
SUSPICIOUS_TLDS = [
    '.xyz', '.top', '.club', '.online', '.site', '.icu', '.vip', '.work', '.loan'
]

# Blacklists for known malicious domains
BLACKLISTS = [
    'https://urlhaus.abuse.ch/downloads/text/',
    'https://openphish.com/feed.txt',
    'https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-domains-ACTIVE.txt'
]

# Cache for blacklisted domains
blacklisted_domains = set()

# Function to update blacklists
def update_blacklists():
    global blacklisted_domains
    for blacklist_url in BLACKLISTS:
        try:
            response = requests.get(blacklist_url, timeout=5)
            if response.status_code == 200:
                domains = response.text.splitlines()
                for domain in domains:
                    domain = domain.strip()
                    if domain and not domain.startswith('#'):
                        blacklisted_domains.add(domain)
        except Exception as e:
            print(f"Error updating blacklist {blacklist_url}: {e}")

# Update blacklists on startup
update_blacklists()

@app.route('/api/analyze', methods=['POST'])
def analyze_url():
    try:
        data = request.json
        if not data:
            print("No JSON data received in request")
            return jsonify({'error': 'No JSON data received'}), 400
            
        url = data.get('url')
        user_id = data.get('user_id')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Check if user exists if user_id is provided
        user = None
        if user_id:
            user = User.query.get(user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
        
        print(f"Analyzing URL: {url}")
        
        # Ensure URL has a scheme
        if not url.startswith(('http://', 'https://')):
            url = 'http://' + url
        
        try:
            # Parse the URL
            parsed_url = urllib.parse.urlparse(url)
            domain = parsed_url.netloc
            
            if not domain:
                return jsonify({'error': 'Invalid URL format'}), 400
                
            print(f"Parsed domain: {domain}")
            
            # Initialize results dictionary
            results = {
                'url': url,
                'domain': domain,
                'indicators': [],
                'creditsEarned': 5
            }
            
            # Check domain age
            print("Checking domain age...")
            domain_age_result = check_domain_age(domain)
            results['indicators'].append(domain_age_result)
            
            # Check SSL certificate
            print("Checking SSL certificate...")
            ssl_result = check_ssl_certificate(domain)
            results['indicators'].append(ssl_result)
            
            # Check URL structure
            print("Checking URL structure...")
            url_structure_result = check_url_structure(url)
            results['indicators'].append(url_structure_result)
            
            # Check blacklist status
            print("Checking blacklist status...")
            blacklist_result = check_blacklist_status(domain)
            results['indicators'].append(blacklist_result)
            
            # Check WHOIS data
            print("Checking WHOIS data...")
            whois_result = check_whois_data(domain)
            results['indicators'].append(whois_result)
            
            # Scrape and analyze website content
            print("Scraping and analyzing website content...")
            content_result, html_content = scrape_and_analyze_content(url)
            results['indicators'].append(content_result)
            
            # Use DeepSeek AI to analyze content
            print("Analyzing with DeepSeek AI...")
            ai_analysis_result = analyze_with_deepseek_ai(url, html_content)
            results['indicators'].append(ai_analysis_result)
            
            # Check for phishing patterns
            print("Checking for phishing patterns...")
            phishing_result = check_phishing_patterns(url, html_content)
            results['indicators'].append(phishing_result)
            
            # Check for malware
            print("Checking for malware...")
            malware_result = check_malware(url, html_content)
            results['indicators'].append(malware_result)
            
            # Check for redirects
            print("Checking for redirects...")
            redirect_result = check_redirects(url)
            results['indicators'].append(redirect_result)
            
            # Calculate overall risk score (weighted average)
            weights = {
                'Domain Age': 0.1,
                'SSL Certificate': 0.1,
                'URL Structure': 0.1,
                'Blacklist Status': 0.15,
                'WHOIS Data': 0.05,
                'Content Analysis': 0.15,
                'AI Analysis': 0.2,
                'Phishing Detection': 0.1,
                'Malware Check': 0.1,
                'Redirect Analysis': 0.05
            }
            
            total_score = 0
            total_weight = 0
            
            for indicator in results['indicators']:
                name = indicator['name']
                # Convert status to score (0-100)
                if indicator['status'] == 'suspicious':
                    indicator_score = 100
                else:
                    indicator_score = 0
                    
                if name in weights:
                    total_score += indicator_score * weights[name]
                    total_weight += weights[name]
            
            if total_weight > 0:
                overall_score = int(total_score / total_weight)
            else:
                overall_score = 0
                
            results['score'] = overall_score
            results['risk'] = 'high' if overall_score > 70 else 'medium' if overall_score > 30 else 'low'
            
            # If user is authenticated, save the URL submission to database
            if user:
                # Determine if it's a scam based on risk level
                is_scam = results['risk'] == 'high'
                
                # Calculate credits earned (5 for submission, 50 bonus if confirmed scam)
                credits_earned = 5
                if is_scam:
                    credits_earned += 50
                
                # Create URL submission record
                url_submission = URLSubmission(
                    url=url,
                    domain=domain,
                    score=overall_score,
                    risk=results['risk'],
                    is_scam=is_scam,
                    credits_earned=credits_earned,
                    user_id=user.id
                )
                
                # Add credits to user
                user.credits += credits_earned
                
                # Save to database
                db.session.add(url_submission)
                db.session.commit()
                
                # Update results with credits earned
                results['creditsEarned'] = credits_earned
            
            print("Analysis complete, returning results")
            return jsonify(results)
        
        except urllib.parse.URLError as url_err:
            print(f"URL parsing error: {str(url_err)}")
            return jsonify({'error': f'Invalid URL: {str(url_err)}'}), 400
            
    except Exception as e:
        print(f"Error analyzing URL: {str(e)}")
        return jsonify({'error': f'Failed to analyze URL: {str(e)}'}), 500

def check_domain_age(domain):
    try:
        domain_info = whois.whois(domain)
        creation_date = domain_info.creation_date
        
        if isinstance(creation_date, list):
            creation_date = creation_date[0]
            
        if creation_date:
            domain_age_days = (datetime.now() - creation_date).days
            if domain_age_days < 180:  # Less than 6 months
                return {
                    'name': 'Domain Age',
                    'status': 'suspicious',
                    'details': f'Domain registered recently ({domain_age_days} days ago)'
                }
        
        return {
            'name': 'Domain Age',
            'status': 'normal',
            'details': 'Domain has been registered for a significant period'
        }
    except Exception as e:
        return {
            'name': 'Domain Age',
            'status': 'suspicious',
            'details': f'Could not verify domain age: {str(e)}'
        }

def check_ssl_certificate(domain):
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                
                # Check if certificate is valid
                if not cert:
                    return {
                        'name': 'SSL Certificate',
                        'status': 'suspicious',
                        'details': 'Invalid SSL certificate'
                    }
                
                # Check expiration
                not_after = cert.get('notAfter')
                if not_after:
                    expiry_date = datetime.strptime(not_after, '%b %d %H:%M:%S %Y %Z')
                    if expiry_date < datetime.now():
                        return {
                            'name': 'SSL Certificate',
                            'status': 'suspicious',
                            'details': 'SSL certificate has expired'
                        }
                
                return {
                    'name': 'SSL Certificate',
                    'status': 'normal',
                    'details': 'Valid SSL certificate'
                }
    except Exception as e:
        return {
            'name': 'SSL Certificate',
            'status': 'suspicious',
            'details': f'SSL certificate issue: {str(e)}'
        }

def check_url_structure(url):
    suspicious_patterns = [
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}',  # IP address
        r'https?://[^/]+\.\w{2,4}/.*@',  # @ in URL
        r'https?://.*?\.(\w{2,4})\.\w{2,4}/',  # Subdomain of TLD
        r'https?://.*?[^\w./-].*?/',  # Special characters
        r'https?://.*?\.(\w{5,})/',  # Unusual TLD
    ]
    
    parsed_url = urllib.parse.urlparse(url)
    domain = parsed_url.netloc
    path = parsed_url.path
    
    # Check for suspicious patterns
    for pattern in suspicious_patterns:
        if re.search(pattern, url):
            return {
                'name': 'URL Structure',
                'status': 'suspicious',
                'details': 'URL contains suspicious patterns or characters'
            }
    
    # Check for suspicious TLDs
    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            return {
                'name': 'URL Structure',
                'status': 'suspicious',
                'details': f'Domain uses suspicious TLD: {tld}'
            }
    
    # Check for excessive subdomains
    subdomain_count = domain.count('.')
    if subdomain_count > 3:
        return {
            'name': 'URL Structure',
            'status': 'suspicious',
            'details': f'Domain has excessive subdomains ({subdomain_count})'
        }
    
    # Check for long domain name
    if len(domain) > 50:
        return {
            'name': 'URL Structure',
            'status': 'suspicious',
            'details': 'Unusually long domain name'
        }
    
    return {
        'name': 'URL Structure',
        'status': 'normal',
        'details': 'URL structure appears normal'
    }

def check_blacklist_status(domain):
    if domain in blacklisted_domains:
        return {
            'name': 'Blacklist Status',
            'status': 'suspicious',
            'details': 'Domain appears on security blacklists'
        }
    
    return {
        'name': 'Blacklist Status',
        'status': 'normal',
        'details': 'Domain not found on known blacklists'
    }

def check_whois_data(domain):
    try:
        domain_info = whois.whois(domain)
        
        # Check for privacy protection
        if not domain_info.registrar or 'privacy' in domain_info.registrar.lower():
            return {
                'name': 'WHOIS Data',
                'status': 'suspicious',
                'details': 'Registration information hidden or using privacy service'
            }
        
        # Check for missing contact information
        if not domain_info.emails and not domain_info.name:
            return {
                'name': 'WHOIS Data',
                'status': 'suspicious',
                'details': 'Missing contact information in WHOIS data'
            }
        
        return {
            'name': 'WHOIS Data',
            'status': 'normal',
            'details': 'WHOIS data appears normal'
        }
    except Exception as e:
        return {
            'name': 'WHOIS Data',
            'status': 'suspicious',
            'details': f'Could not verify WHOIS data: {str(e)}'
        }

def scrape_and_analyze_content(url):
    try:
        # Set a reasonable timeout for requests
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        try:
            response = requests.get(url, headers=headers, timeout=15, verify=False)
            html_content = response.text
        except requests.exceptions.Timeout:
            print(f"Timeout error when fetching {url}")
            return {
                'name': 'Content Analysis',
                'status': 'suspicious',
                'details': 'Website took too long to respond, which can be suspicious'
            }, ""
        except requests.exceptions.SSLError as ssl_err:
            print(f"SSL error when fetching {url}: {str(ssl_err)}")
            return {
                'name': 'Content Analysis',
                'status': 'suspicious',
                'details': 'SSL certificate verification failed'
            }, ""
        except requests.exceptions.ConnectionError as conn_err:
            print(f"Connection error when fetching {url}: {str(conn_err)}")
            return {
                'name': 'Content Analysis',
                'status': 'suspicious',
                'details': 'Could not connect to the website'
            }, ""
        except Exception as e:
            print(f"Unexpected error when fetching {url}: {str(e)}")
            return {
                'name': 'Content Analysis',
                'status': 'suspicious',
                'details': f'Error analyzing content: {str(e)}'
            }, ""
        
        # Parse HTML content
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Check for suspicious content
        text_content = soup.get_text().lower()
        suspicious_count = 0
        found_keywords = []
        
        for keyword in SUSPICIOUS_KEYWORDS:
            if keyword.lower() in text_content:
                suspicious_count += 1
                found_keywords.append(keyword)
        
        # Check for login forms
        login_forms = soup.find_all('form')
        has_login_form = False
        for form in login_forms:
            inputs = form.find_all('input')
            password_field = False
            for input_field in inputs:
                if input_field.get('type') == 'password':
                    password_field = True
                    break
            if password_field:
                has_login_form = True
                break
        
        # Determine status based on findings
        if suspicious_count > 5 or has_login_form:
            status = 'suspicious'
            details = f'Found {suspicious_count} suspicious keywords'
            if has_login_form:
                details += ' and login form requesting credentials'
            if found_keywords:
                details += f". Keywords: {', '.join(found_keywords[:5])}"
                if len(found_keywords) > 5:
                    details += f" and {len(found_keywords) - 5} more"
        else:
            status = 'normal'
            details = 'No suspicious content patterns detected'
        
        return {
            'name': 'Content Analysis',
            'status': status,
            'details': details
        }, html_content
    
    except requests.exceptions.Timeout:
        return {
            'name': 'Content Analysis',
            'status': 'suspicious',
            'details': 'Website took too long to respond, which can be suspicious'
        }, ""
    except requests.exceptions.SSLError:
        return {
            'name': 'Content Analysis',
            'status': 'suspicious',
            'details': 'SSL certificate verification failed'
        }, ""
    except requests.exceptions.ConnectionError:
        return {
            'name': 'Content Analysis',
            'status': 'suspicious',
            'details': 'Could not connect to the website'
        }, ""
    except Exception as e:
        return {
            'name': 'Content Analysis',
            'status': 'suspicious',
            'details': f'Error analyzing content: {str(e)}'
        }, ""

def analyze_with_deepseek_ai(url, html_content):
    try:
        # Extract text content from HTML
        soup = BeautifulSoup(html_content, 'html.parser')
        text_content = soup.get_text()
        
        # Truncate content if too long
        if len(text_content) > 4000:
            text_content = text_content[:4000] + "..."
        
        # Prepare prompt for DeepSeek AI
        prompt = f"""Analyze this website content and determine if it's likely to be a scam or phishing website. 
        URL: {url}
        
        Content:
        {text_content}
        
        Analyze the content for:
        1. Suspicious language patterns (urgency, threats, too-good-to-be-true offers)
        2. Request for personal or financial information
        3. Poor grammar or spelling
        4. Impersonation of legitimate brands or services
        5. Misleading content or false claims
        
        Provide a risk assessment (high, medium, or low) and explain why."""
        
        try:
            # Call DeepSeek AI API
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {DEEPSEEK_API_KEY}'
            }
            
            payload = {
                'model': 'deepseek-chat',
                'messages': [
                    {'role': 'system', 'content': 'You are an AI assistant specialized in detecting scam and phishing websites.'},
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.3,
                'max_tokens': 500
            }
            
            print(f"Calling DeepSeek API with key: {DEEPSEEK_API_KEY[:5]}...")
            response = requests.post(DEEPSEEK_API_URL, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                ai_response = response.json()
                ai_analysis = ai_response.get('choices', [{}])[0].get('message', {}).get('content', '')
                
                print(f"DeepSeek AI analysis: {ai_analysis[:100]}...")
                
                # Extract risk level from AI response
                risk_level = 'medium'  # Default
                if 'high risk' in ai_analysis.lower() or 'high' in ai_analysis.lower():
                    risk_level = 'suspicious'
                    details = f"DeepSeek AI analysis: {ai_analysis}"
                elif 'low risk' in ai_analysis.lower() or 'low' in ai_analysis.lower():
                    risk_level = 'normal'
                    details = f"DeepSeek AI analysis: {ai_analysis}"
                else:
                    risk_level = 'suspicious'
                    details = f"DeepSeek AI analysis: {ai_analysis}"
                
                return {
                    'name': 'AI Analysis',
                    'status': risk_level,
                    'details': details
                }
            else:
                # Log the error for debugging
                print(f"DeepSeek API error: {response.status_code} - {response.text}")
                # Return a result that won't break the analysis
                return {
                    'name': 'AI Analysis',
                    'status': 'normal',
                    'details': f'AI analysis unavailable - API returned status code {response.status_code}. Response: {response.text}'
                }
        except requests.exceptions.RequestException as req_err:
            # Log the specific request error
            print(f"DeepSeek API request error: {str(req_err)}")
            return {
                'name': 'AI Analysis',
                'status': 'normal',
                'details': f'AI analysis unavailable - connection error occurred: {str(req_err)}'
            }
    except Exception as e:
        # Log the general exception
        print(f"Error in analyze_with_deepseek_ai: {str(e)}")
        return {
            'name': 'AI Analysis',
            'status': 'normal',
            'details': f'AI analysis unavailable - an error occurred: {str(e)}'
        }

def check_phishing_patterns(url, html_content):
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Check for login forms
        login_forms = soup.find_all('form')
        password_fields = soup.find_all('input', {'type': 'password'})
        
        # Check for brand impersonation
        common_brands = ['paypal', 'apple', 'microsoft', 'google', 'amazon', 'facebook', 'netflix', 'bank']
        brand_mentions = []
        
        for brand in common_brands:
            if brand.lower() in html_content.lower():
                brand_mentions.append(brand)
        
        # Check for security seals/logos
        img_tags = soup.find_all('img')
        security_logos = 0
        for img in img_tags:
            src = img.get('src', '')
            alt = img.get('alt', '')
            if any(term in (src + alt).lower() for term in ['secure', 'security', 'lock', 'ssl', 'safe', 'verified']):
                security_logos += 1
        
        # Check for misleading domain (e.g., paypal-secure.com)
        parsed_url = urllib.parse.urlparse(url)
        domain = parsed_url.netloc
        
        domain_impersonation = False
        for brand in common_brands:
            if brand in domain and brand not in domain.split('.')[0]:
                domain_impersonation = True
        
        # Determine if it's likely a phishing site
        if (login_forms and password_fields and brand_mentions) or domain_impersonation or (security_logos > 2 and brand_mentions):
            return {
                'name': 'Phishing Detection',
                'status': 'suspicious',
                'details': f'Possible phishing attempt impersonating: {", ".join(brand_mentions)}'
            }
        
        return {
            'name': 'Phishing Detection',
            'status': 'normal',
            'details': 'No obvious phishing patterns detected'
        }
    except Exception as e:
        return {
            'name': 'Phishing Detection',
            'status': 'suspicious',
            'details': f'Could not complete phishing analysis: {str(e)}'
        }

def check_malware(url, html_content):
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Check for suspicious scripts
        scripts = soup.find_all('script')
        suspicious_script_count = 0
        
        for script in scripts:
            script_content = script.string if script.string else ''
            script_src = script.get('src', '')
            
            # Check for obfuscated JavaScript
            if script_content and any(pattern in script_content for pattern in [
                'eval(', 'document.write(', 'escape(', 'unescape(', 'fromCharCode', 
                'String.fromCharCode', 'parseInt(', '.substring(', '.substr('
            ]):
                suspicious_script_count += 1
            
            # Check for suspicious external scripts
            if script_src and any(domain not in script_src for domain in ['jquery', 'google', 'cloudflare', 'bootstrap']):
                suspicious_script_count += 1
        
        # Check for hidden iframes
        iframes = soup.find_all('iframe')
        hidden_iframes = 0
        
        for iframe in iframes:
            style = iframe.get('style', '')
            if 'display:none' in style or 'visibility:hidden' in style or iframe.get('hidden'):
                hidden_iframes += 1
        
        # Check for suspicious redirects in meta tags
        meta_redirects = soup.find_all('meta', {'http-equiv': 'refresh'})
        
        if suspicious_script_count > 2 or hidden_iframes > 0 or meta_redirects:
            return {
                'name': 'Malware Check',
                'status': 'suspicious',
                'details': f'Found {suspicious_script_count} suspicious scripts, {hidden_iframes} hidden iframes'
            }
        
        return {
            'name': 'Malware Check',
            'status': 'normal',
            'details': 'No obvious malware indicators detected'
        }
    except Exception as e:
        return {
            'name': 'Malware Check',
            'status': 'suspicious',
            'details': f'Could not complete malware analysis: {str(e)}'
        }

def check_redirects(url):
    try:
        # Follow redirects and track the chain
        response = requests.get(url, allow_redirects=False, timeout=5)
        redirect_chain = []
        max_redirects = 10
        redirect_count = 0
        
        current_url = url
        while 300 <= response.status_code < 400 and redirect_count < max_redirects:
            redirect_count += 1
            location = response.headers.get('Location')
            
            if not location:
                break
                
            # Handle relative URLs
            if not location.startswith(('http://', 'https://')):
                parsed_url = urllib.parse.urlparse(current_url)
                base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
                location = urllib.parse.urljoin(base_url, location)
            
            redirect_chain.append(location)
            current_url = location
            
            try:
                response = requests.get(location, allow_redirects=False, timeout=5)
            except Exception:
                break
        
        # Check for suspicious redirect patterns
        if redirect_count > 3:
            return {
                'name': 'Redirect Analysis',
                'status': 'suspicious',
                'details': f'Multiple redirects detected ({redirect_count})'
            }
        
        # Check if final destination is different domain
        if redirect_chain and urllib.parse.urlparse(url).netloc != urllib.parse.urlparse(redirect_chain[-1]).netloc:
            return {
                'name': 'Redirect Analysis',
                'status': 'suspicious',
                'details': 'Redirects to a different domain'
            }
        
        return {
            'name': 'Redirect Analysis',
            'status': 'normal',
            'details': 'No suspicious redirects detected'
        }
    except Exception as e:
        return {
            'name': 'Redirect Analysis',
            'status': 'suspicious',
            'details': f'Could not analyze redirects: {str(e)}'
        }

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
