@echo off

:: NOTE: Titanium Desktop seems to have a bug in Win32 when parsing non-ascii 
:: characters in any other encoding. So we have to do a work around by using 
:: a small wrapper for Windows's encoding conversion APIs to generate UTF8.

cd %~dp0
ls.exe -LRAp --color=never --fast --stream=n %1 | win_iconv.exe -f windows-1252 -t utf-8
