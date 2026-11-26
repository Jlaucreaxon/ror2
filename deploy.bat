@echo off
chcp 65001
echo === 1. 檢查並打包所有變更檔案 ===
git add -A
git status -s

echo === 2. 建立版本快照 ===
set /p msg="請輸入本次更新說明 (直接按 Enter 預設為自動更新): "
if "%msg%"=="" set msg=Auto update %date% %time%
git commit -m "%msg%"

echo === 3. 推送到 GitHub 雲端 ===
git push -u origin main

echo === 完成！約 30 秒後線上版自動更新 ===
pause
