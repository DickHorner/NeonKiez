param(
    [Parameter(Mandatory=$true)]
    [string]$KenneyRoot,

    [Parameter(Mandatory=$true)]
    [string]$RepoRoot
)

$ErrorActionPreference = "Stop"

function Copy-RequiredFile {
    param(
        [Parameter(Mandatory=$true)][string]$RelativeSource,
        [Parameter(Mandatory=$true)][string]$RelativeTarget
    )

    $source = Join-Path $KenneyRoot $RelativeSource
    $target = Join-Path $RepoRoot $RelativeTarget
    $targetDir = Split-Path $target -Parent

    if (-not (Test-Path $source)) {
        Write-Warning "Missing source: $RelativeSource"
        return
    }

    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
    Copy-Item -Force -Path $source -Destination $target
    Write-Host "Copied $RelativeSource -> $RelativeTarget"
}

function Copy-RequiredFolder {
    param(
        [Parameter(Mandatory=$true)][string]$RelativeSourceFolder,
        [Parameter(Mandatory=$true)][string]$RelativeTargetFolder
    )

    $source = Join-Path $KenneyRoot $RelativeSourceFolder
    $target = Join-Path $RepoRoot $RelativeTargetFolder

    if (-not (Test-Path $source)) {
        Write-Warning "Missing source folder: $RelativeSourceFolder"
        return
    }

    New-Item -ItemType Directory -Force -Path $target | Out-Null
    Copy-Item -Force -Recurse -Path (Join-Path $source "*") -Destination $target
    Write-Host "Copied folder $RelativeSourceFolder -> $RelativeTargetFolder"
}

Write-Host "Kenney root: $KenneyRoot"
Write-Host "Repo root:   $RepoRoot"
Write-Host "Staging Batch 1 candidate pools..."

# 1) RPG Urban Pack
Copy-RequiredFile "2D assets\RPG Urban Pack\License.txt" "assets\working\palette-tests\kenney-batch1\hub\RPG Urban Pack\License.txt"
Copy-RequiredFile "2D assets\RPG Urban Pack\Preview.png" "assets\working\palette-tests\kenney-batch1\hub\RPG Urban Pack\Preview.png"
Copy-RequiredFile "2D assets\RPG Urban Pack\Sample.png" "assets\working\palette-tests\kenney-batch1\hub\RPG Urban Pack\Sample.png"
Copy-RequiredFolder "2D assets\RPG Urban Pack\Tilemap" "assets\working\palette-tests\kenney-batch1\hub\RPG Urban Pack\Tilemap"
Copy-RequiredFolder "2D assets\RPG Urban Pack\Tiles" "assets\working\palette-tests\kenney-batch1\hub\RPG Urban Pack\Tiles"
Copy-RequiredFolder "2D assets\RPG Urban Pack\Bonus" "assets\working\palette-tests\kenney-batch1\hub\RPG Urban Pack\Bonus"

# 2) Roguelike City Pack
Copy-RequiredFile "2D assets\Roguelike City Pack\License.txt" "assets\working\palette-tests\kenney-batch1\hub\Roguelike City Pack\License.txt"
Copy-RequiredFile "2D assets\Roguelike City Pack\Preview.png" "assets\working\palette-tests\kenney-batch1\hub\Roguelike City Pack\Preview.png"
Copy-RequiredFile "2D assets\Roguelike City Pack\Sample.png" "assets\working\palette-tests\kenney-batch1\hub\Roguelike City Pack\Sample.png"
Copy-RequiredFile "2D assets\Roguelike City Pack\Tilesheet.txt" "assets\working\palette-tests\kenney-batch1\hub\Roguelike City Pack\Tilesheet.txt"
Copy-RequiredFolder "2D assets\Roguelike City Pack\Tilemap" "assets\working\palette-tests\kenney-batch1\hub\Roguelike City Pack\Tilemap"
Copy-RequiredFolder "2D assets\Roguelike City Pack\Tiles" "assets\working\palette-tests\kenney-batch1\hub\Roguelike City Pack\Tiles"

# 3) Roguelike Characters Pack
Copy-RequiredFile "2D assets\Roguelike Characters Pack\License.txt" "assets\working\palette-tests\kenney-batch1\hub\Roguelike Characters Pack\License.txt"
Copy-RequiredFile "2D assets\Roguelike Characters Pack\Preview.png" "assets\working\palette-tests\kenney-batch1\hub\Roguelike Characters Pack\Preview.png"
Copy-RequiredFile "2D assets\Roguelike Characters Pack\Sample.png" "assets\working\palette-tests\kenney-batch1\hub\Roguelike Characters Pack\Sample.png"
Copy-RequiredFolder "2D assets\Roguelike Characters Pack\Spritesheet" "assets\working\palette-tests\kenney-batch1\hub\Roguelike Characters Pack\Spritesheet"

# 4) Input Prompts Pixel 16x. Source uses Unicode multiplication sign.
Copy-RequiredFile "Icons\Input Prompts Pixel 16×\License.txt" "assets\working\palette-tests\kenney-batch1\ui\Input Prompts Pixel 16x\License.txt"
Copy-RequiredFile "Icons\Input Prompts Pixel 16×\Preview.png" "assets\working\palette-tests\kenney-batch1\ui\Input Prompts Pixel 16x\Preview.png"
Copy-RequiredFile "Icons\Input Prompts Pixel 16×\Tilesheet.txt" "assets\working\palette-tests\kenney-batch1\ui\Input Prompts Pixel 16x\Tilesheet.txt"
Copy-RequiredFolder "Icons\Input Prompts Pixel 16×\Tilemap" "assets\working\palette-tests\kenney-batch1\ui\Input Prompts Pixel 16x\Tilemap"
Copy-RequiredFolder "Icons\Input Prompts Pixel 16×\Tiles" "assets\working\palette-tests\kenney-batch1\ui\Input Prompts Pixel 16x\Tiles"

# 5) UI Pixel Pack
Copy-RequiredFile "UI assets\UI Pixel Pack\Instructions.txt" "assets\working\palette-tests\kenney-batch1\ui\UI Pixel Pack\Instructions.txt"
Copy-RequiredFile "UI assets\UI Pixel Pack\License.txt" "assets\working\palette-tests\kenney-batch1\ui\UI Pixel Pack\License.txt"
Copy-RequiredFile "UI assets\UI Pixel Pack\Preview.png" "assets\working\palette-tests\kenney-batch1\ui\UI Pixel Pack\Preview.png"
Copy-RequiredFolder "UI assets\UI Pixel Pack\Spritesheet" "assets\working\palette-tests\kenney-batch1\ui\UI Pixel Pack\Spritesheet"

Write-Host "Batch 1 staging complete."
Write-Host "Next: visually inspect assets/working/palette-tests/kenney-batch1 and copy only final selected files to assets/selected/kenney/."
