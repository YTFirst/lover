Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectPath = Split-Path -Parent $scriptPath
$serverPath = Join-Path $projectPath "backend\server.js"

$serverProcess = $null
$isServerRunning = $false

function Start-Server {
    if ($script:isServerRunning) {
        [System.Windows.Forms.MessageBox]::Show("Server is already running!`nURL: http://localhost:5050", "Info", "OK", "Information")
        return
    }
    
    $script:serverProcess = Start-Process -FilePath "node" -ArgumentList $serverPath -WorkingDirectory (Join-Path $projectPath "backend") -PassThru -WindowStyle Hidden
    $script:isServerRunning = $true
    
    Start-Sleep -Seconds 2
    
    [System.Windows.Forms.MessageBox]::Show("Server started successfully!`nURL: http://localhost:5050", "Success", "OK", "Information")
}

function Stop-Server {
    if (-not $script:isServerRunning -or $null -eq $script:serverProcess) {
        [System.Windows.Forms.MessageBox]::Show("Server is not running!", "Info", "OK", "Information")
        return
    }
    
    Stop-Process -Id $script:serverProcess.Id -Force -ErrorAction SilentlyContinue
    $script:serverProcess = $null
    $script:isServerRunning = $false
    
    [System.Windows.Forms.MessageBox]::Show("Server stopped!", "Success", "OK", "Information")
}

function Open-Browser {
    Start-Process "http://localhost:5050"
}

$icon = New-Object System.Drawing.Icon("$scriptPath\icon.ico")
$trayIcon = New-Object System.Windows.Forms.NotifyIcon
$trayIcon.Icon = $icon
$trayIcon.Text = "Electronic Girlfriend"
$trayIcon.Visible = $true

$contextMenu = New-Object System.Windows.Forms.ContextMenuStrip

$menuStart = $contextMenu.Items.Add("Start Server")
$menuStart.Add_Click({ Start-Server })

$menuStop = $contextMenu.Items.Add("Stop Server")
$menuStop.Add_Click({ Stop-Server })

$menuBrowser = $contextMenu.Items.Add("Open Browser")
$menuBrowser.Add_Click({ Open-Browser })

$contextMenu.Items.Add("-") | Out-Null

$menuExit = $contextMenu.Items.Add("Exit")
$menuExit.Add_Click({
    Stop-Server
    $trayIcon.Visible = $false
    $trayIcon.Dispose()
    [System.Windows.Forms.Application]::Exit()
})

$trayIcon.ContextMenuStrip = $contextMenu

$trayIcon.Add_DoubleClick({ Open-Browser })

[System.Windows.Forms.Application]::Run()
