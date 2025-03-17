$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:5173/")
$listener.Start()

Write-Host "Server started at http://localhost:5173/"
Write-Host "Press Ctrl+C to stop the server"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") {
            $localPath = "/test-page.html"
        }
        
        $filename = Join-Path $PSScriptRoot $localPath.TrimStart("/")
        
        if (Test-Path $filename) {
            $content = Get-Content $filename -Raw
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
            $notFoundMessage = "File not found: $localPath"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($notFoundMessage)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        
        $response.Close()
    }
} finally {
    $listener.Stop()
}
