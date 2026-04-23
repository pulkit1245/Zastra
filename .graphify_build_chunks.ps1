$ErrorActionPreference = "Stop"
$chunks = Get-Content ".graphify_chunks.json" -Raw | ConvertFrom-Json
$targetCount = 11
New-Item -ItemType Directory -Path "graphify-out" -Force | Out-Null

function Empty-Chunk {
    return @{
        nodes = @()
        edges = @()
        hyperedges = @()
        input_tokens = 0
        output_tokens = 0
    }
}

for ($i = 1; $i -le $targetCount; $i++) {
    $outPath = "graphify-out/.graphify_chunk_{0:D2}.json" -f $i
    $result = Empty-Chunk

    try {
        $nodeMap = @{}
        $edges = New-Object System.Collections.ArrayList
        $hyperedges = New-Object System.Collections.ArrayList
        $seen = @{}
        $inputTokens = 0

        $chunkIndex = $i - 1
        $chunkFiles = @()
        if ($chunkIndex -lt $chunks.Count) {
            $chunkFiles = @($chunks[$chunkIndex])
        }

        foreach ($rel in $chunkFiles) {
            if (-not $rel) { continue }
            $relNorm = ($rel.ToString() -replace '\\','/')
            $abs = Join-Path (Get-Location) $rel
            if (-not (Test-Path $abs)) { continue }

            $text = ""
            try { $text = Get-Content $abs -Raw -ErrorAction Stop } catch { continue }

            $fileId = "file:$relNorm"
            if (-not $nodeMap.ContainsKey($fileId)) {
                $nodeMap[$fileId] = @{ id = $fileId; label = [IO.Path]::GetFileName($abs); type = "file"; source_file = $relNorm }
            }

            $inputTokens += ([regex]::Matches($text, '\S+')).Count

            $entityMatches = [regex]::Matches($text, '(?im)\b(class|interface|enum|record|def|function)\s+([A-Za-z_][A-Za-z0-9_]*)')
            foreach ($m in $entityMatches) {
                $name = $m.Groups[2].Value
                if ([string]::IsNullOrWhiteSpace($name)) { continue }
                $eid = "entity:$relNorm::$name"
                if (-not $nodeMap.ContainsKey($eid)) {
                    $nodeMap[$eid] = @{ id = $eid; label = $name; type = "concept"; source_file = $relNorm }
                }
                $k = "$fileId|$eid|contains|$relNorm"
                if (-not $seen.ContainsKey($k)) {
                    $seen[$k] = $true
                    [void]$edges.Add(@{ source = $fileId; target = $eid; type = "contains"; confidence = "EXTRACTED"; confidence_score = 0.9; source_file = $relNorm; weight = 1.0 })
                }
            }

            $importMatches = [regex]::Matches($text, '(?im)^\s*(import|from)\s+([A-Za-z0-9_\./@-]+)')
            foreach ($m in $importMatches) {
                $mod = $m.Groups[2].Value
                if ([string]::IsNullOrWhiteSpace($mod)) { continue }
                $mid = "module:$mod"
                if (-not $nodeMap.ContainsKey($mid)) {
                    $nodeMap[$mid] = @{ id = $mid; label = $mod; type = "module"; source_file = $relNorm }
                }
                $k = "$fileId|$mid|depends_on|$relNorm"
                if (-not $seen.ContainsKey($k)) {
                    $seen[$k] = $true
                    [void]$edges.Add(@{ source = $fileId; target = $mid; type = "depends_on"; confidence = "EXTRACTED"; confidence_score = 0.85; source_file = $relNorm; weight = 0.8 })
                }
            }
        }

        $nodes = @($nodeMap.Values)
        $compact = @{nodes=$nodes;edges=@($edges);hyperedges=@($hyperedges)} | ConvertTo-Json -Depth 10 -Compress
        $outputTokens = ([regex]::Matches($compact, '\S+')).Count

        $result = @{
            nodes = $nodes
            edges = @($edges)
            hyperedges = @($hyperedges)
            input_tokens = $inputTokens
            output_tokens = $outputTokens
        }
    } catch {
        $result = Empty-Chunk
    }

    $result | ConvertTo-Json -Depth 10 | Set-Content -Path $outPath -Encoding UTF8
}

$ok = $true
for ($i = 1; $i -le $targetCount; $i++) {
    $p = "graphify-out/.graphify_chunk_{0:D2}.json" -f $i
    if (-not (Test-Path $p)) { $ok = $false; continue }
    $j = Get-Content $p -Raw | ConvertFrom-Json
    if ($null -eq $j.nodes -or $null -eq $j.edges -or $null -eq $j.hyperedges -or $null -eq $j.input_tokens -or $null -eq $j.output_tokens) { $ok = $false }
    foreach ($e in @($j.edges)) {
        if ($null -eq $e.confidence -or $null -eq $e.confidence_score -or $null -eq $e.source_file -or $null -eq $e.weight) { $ok = $false; break }
    }
}

if ($ok) { "OK" } else { "NOT_OK" }
