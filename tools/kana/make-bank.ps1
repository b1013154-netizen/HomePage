$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Speech
$voice=New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.SelectVoice('Microsoft Haruka Desktop')
$fmt=New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050,[System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,[System.Speech.AudioFormat.AudioChannel]::Mono)
$kana=@('あいうえおかきくけこがぎぐげござじずぜぞさしすせそたちつてとだぢづでどなにぬねのはひふへほばびぶべぼぱぴぷぺぽまみむめもやゆよらりるれろわをんゔ'.ToCharArray()|ForEach-Object {[string]$_}) + ('きゃ きゅ きょ しゃ しゅ しょ ちゃ ちゅ ちょ にゃ にゅ にょ ひゃ ひゅ ひょ みゃ みゅ みょ りゃ りゅ りょ ぎゃ ぎゅ ぎょ じゃ じゅ じょ びゃ びゅ びょ ぴゃ ぴゅ ぴょ ふぁ ふぃ ふぇ ふぉ てぃ でぃ とぅ どぅ しぇ じぇ ちぇ うぃ うぇ うぉ つぁ つぃ つぇ つぉ ゔぁ ゔぃ ゔぇ ゔぉ' -split ' ')
$path=Join-Path (Get-Location) 'public/assets/kana-bank.pcm'
$file=[IO.File]::Create($path)
$map=@{}
try { foreach($k in $kana){$mem=[IO.MemoryStream]::new();$voice.SetOutputToAudioStream($mem,$fmt);$voice.Speak($k+'ー');$voice.SetOutputToNull();$bytes=$mem.ToArray();$map[$k]=@($file.Position,$bytes.Length);$file.Write($bytes,0,$bytes.Length);$mem.Dispose()} } finally {$file.Dispose();$voice.Dispose()}
$map|ConvertTo-Json -Compress|Set-Content -Encoding utf8 public/assets/kana-bank.json
