#!/bin/bash
# 美以伊冲突每小时新闻收集

WORKDIR="/root/.openclaw/workspace"
LOGFILE="$WORKDIR/memory/iran-conflict-$(date +%Y-%m-%d).md"
TIMESTAMP=$(date "+%Y-%m-%d %H:%M")

mkdir -p "$WORKDIR/memory"

# 收集新闻 (使用 Al Jazeera RSS)
NEWS=$(curl -s "https://www.aljazeera.com/xml/rss/all.xml" 2>/dev/null | \
  grep -i "iran\|israel\|us.*military" | \
  head -10 | \
  sed 's/<[^>]*>//g' | \
  sed 's/&amp;/\&/g' | \
  sed 's/&lt;/\</g' | \
  sed 's/&gt;/\>/g')

# 写入日志
echo "## $TIMESTAMP" >> "$LOGFILE"
echo "$NEWS" >> "$LOGFILE"
echo "" >> "$LOGFILE"

# 同时输出以便 cron 记录
echo "[$TIMESTAMP] News collected"
