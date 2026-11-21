#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# 超级马里奥：肉鸽奥德赛 (SUPER MARIO: ROGUE ODYSSEY) 启动脚本
# 用法:
#   ./start.sh              # 默认端口 8090 并自动打开浏览器
#   ./start.sh 9000         # 指定自定义端口
#   ./start.sh --no-open    # 仅启动服务器，不自动打开浏览器
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=8090
AUTO_OPEN=true

for arg in "$@"; do
  case "$arg" in
    --no-open)
      AUTO_OPEN=false
      ;;
    -h|--help)
      echo "用法: $0 [端口号] [--no-open]"
      echo "  端口号      可选，默认 8090"
      echo "  --no-open   仅启动服务器，不自动打开浏览器"
      exit 0
      ;;
    *)
      if [[ "$arg" =~ ^[0-9]+$ ]]; then
        PORT="$arg"
      else
        echo "未知参数: $arg" >&2
        exit 1
      fi
      ;;
  esac
done

URL="http://localhost:${PORT}/en/"
URL_ZH="http://localhost:${PORT}/zh/"

# 检查端口是否已被占用
if lsof -iTCP:"$PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "⚠️  端口 ${PORT} 已被占用。"
  echo "👉 English Edition (Default): ${URL}"
  echo "👉 中文旗舰版:                 ${URL_ZH}"
  echo "👉 或换一个端口启动，例如: $0 $((PORT + 1))"
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ 未检测到 python3，请先安装 Python 3。" >&2
  exit 1
fi

echo "=================================================="
echo "🍄 SUPER MARIO: ROGUE ODYSSEY / 超级马里奥：肉鸽奥德赛"
echo "📂 目录:    ${SCRIPT_DIR}"
echo "🌐 英文版:  ${URL}  (默认)"
echo "🌐 中文版:  ${URL_ZH}"
echo "⏹  按 Ctrl+C 停止游戏服务器"
echo "=================================================="

# 延迟短暂时间后自动在浏览器打开
if [[ "$AUTO_OPEN" == "true" ]] && command -v open >/dev/null 2>&1; then
  (sleep 0.6 && open "$URL") &
fi

cd "$SCRIPT_DIR"
exec python3 - "$PORT" <<'PY'
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

port = int(sys.argv[1])

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

ThreadingHTTPServer.allow_reuse_address = True
server = ThreadingHTTPServer(("", port), NoCacheHandler)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
PY
