$content = Get-Content Home.jsx
$newContent = $content[0..1536] + $content[1732..($content.Length-1)]
$newContent | Set-Content Home.jsx
