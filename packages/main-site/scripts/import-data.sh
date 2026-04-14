#!/bin/bash

# 数据迁移脚本 - 将开发环境数据导入生产环境
# 使用方法: ./scripts/import-data.sh

set -e

echo "=========================================="
echo "OneClaw 数据迁移工具"
echo "=========================================="

# 生产环境域名
PROD_URL="${PROD_URL:-https://oneclaw.shop}"
DATA_FILE="${DATA_FILE:-./data-export.json}"

echo ""
echo "目标环境: $PROD_URL"
echo "数据文件: $DATA_FILE"
echo ""

# 检查数据文件是否存在
if [ ! -f "$DATA_FILE" ]; then
  echo "❌ 错误: 数据文件不存在: $DATA_FILE"
  exit 1
fi

# 显示数据统计
echo "数据统计:"
cat "$DATA_FILE" | python3 -c "
import sys, json
d = json.load(sys.stdin)
counts = d.get('counts', {})
print(f'  - 工具: {counts.get(\"tools\", 0)} 个')
print(f'  - 提示词: {counts.get(\"prompts\", 0)} 个')
print(f'  - 教程: {counts.get(\"tutorials\", 0)} 个')
print(f'  - 分类: {counts.get(\"categories\", 0)} 个')
print(f'  - 标签: {counts.get(\"tags\", 0)} 个')
"
echo ""

# 确认导入
read -p "确认导入数据到生产环境? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "已取消"
  exit 0
fi

echo ""
echo "开始导入数据..."

# 导入数据
RESPONSE=$(curl -s -X POST "${PROD_URL}/api/admin/data-migration" \
  -H "Content-Type: application/json" \
  -d @${DATA_FILE})

echo ""
echo "导入结果:"
echo "$RESPONSE" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if d.get('success'):
  print('✅ 导入成功!')
  results = d.get('results', {})
  for table, stats in results.items():
    print(f'  {table}: 插入 {stats.get(\"inserted\", 0)}, 更新 {stats.get(\"updated\", 0)}, 跳过 {stats.get(\"skipped\", 0)}')
else:
  print('❌ 导入失败:', d.get('error', '未知错误'))
"

echo ""
echo "=========================================="
echo "数据迁移完成"
echo "=========================================="
