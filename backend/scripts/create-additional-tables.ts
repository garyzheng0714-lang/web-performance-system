/**
 * 创建额外的3张中文表名的表格
 * 1. 考核周期表
 * 2. 部门表
 * 3. 操作日志表
 */

import * as lark from '@larksuiteoapi/node-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new lark.Client({
  appId: process.env.FEISHU_APP_ID!,
  appSecret: process.env.FEISHU_APP_SECRET!,
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Feishu,
});

const baseToken = process.env.BITABLE_APP_TOKEN!;

interface TableSchema {
  name: string;
  fields: Array<{
    field_name: string;
    type: number;
    property?: any;
  }>;
}

// 新表结构定义（中文表名和字段名）
const newTableSchemas: TableSchema[] = [
  {
    name: '考核周期',
    fields: [
      { field_name: '周期ID', type: 1 },
      { field_name: '周期名称', type: 1 },
      { field_name: '年度', type: 2 },
      { field_name: '季度', type: 2 },
      { field_name: '开始日期', type: 5 },
      { field_name: '结束日期', type: 5 },
      {
        field_name: '状态',
        type: 3,
        property: {
          options: [
            { name: '准备中' },
            { name: '进行中' },
            { name: '评分中' },
            { name: '校准中' },
            { name: '已完成' },
            { name: '已归档' },
          ],
        },
      },
      { field_name: '创建时间', type: 5 },
      { field_name: '更新时间', type: 5 },
    ],
  },
  {
    name: '部门',
    fields: [
      { field_name: '部门ID', type: 1 },
      { field_name: '部门名称', type: 1 },
      { field_name: '父部门ID', type: 1 },
      { field_name: '部门负责人ID', type: 1 },
      { field_name: '层级', type: 2 },
      { field_name: '路径', type: 1 },
      {
        field_name: '状态',
        type: 3,
        property: {
          options: [
            { name: '启用' },
            { name: '停用' },
          ],
        },
      },
      { field_name: '创建时间', type: 5 },
    ],
  },
  {
    name: '操作日志',
    fields: [
      { field_name: '日志ID', type: 1 },
      { field_name: '用户ID', type: 1 },
      {
        field_name: '操作类型',
        type: 3,
        property: {
          options: [
            { name: '创建' },
            { name: '更新' },
            { name: '删除' },
            { name: '审批' },
            { name: '拒绝' },
            { name: '评分' },
          ],
        },
      },
      {
        field_name: '资源类型',
        type: 3,
        property: {
          options: [
            { name: '目标' },
            { name: '完成情况' },
            { name: '审批' },
            { name: '员工' },
          ],
        },
      },
      { field_name: '资源ID', type: 1 },
      { field_name: '旧值', type: 1 },
      { field_name: '新值', type: 1 },
      { field_name: 'IP地址', type: 1 },
      { field_name: '用户代理', type: 1 },
      { field_name: '操作时间', type: 5 },
    ],
  },
];

async function createTable(schema: TableSchema) {
  console.log(`📝 创建表格: ${schema.name}...`);
  try {
    const res = await client.bitable.appTable.create({
      path: {
        app_token: baseToken,
      },
      data: {
        table: {
          name: schema.name,
          default_view_name: '表格视图',
          fields: schema.fields,
        },
      },
    });

    if (res.data?.table_id) {
      console.log(`  ✅ 创建成功! Table ID: ${res.data.table_id}\n`);
      return res.data.table_id;
    } else {
      throw new Error('创建失败，未返回table_id');
    }
  } catch (error: any) {
    console.error(`  ❌ 创建失败:`, error.message);
    if (error.response?.data) {
      console.error('  详细错误:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

async function main() {
  console.log('🚀 创建额外的中文表名表格\n');
  console.log(`Base Token: ${baseToken}\n`);

  try {
    const tableIds: Record<string, string> = {};

    for (const schema of newTableSchemas) {
      const tableId = await createTable(schema);
      tableIds[schema.name] = tableId;
    }

    console.log('🎉 所有表格创建完成！\n');
    console.log('表格列表:');
    Object.entries(tableIds).forEach(([name, id]) => {
      console.log(`  ✅ ${name}: ${id}`);
    });

    console.log('\n下一步:');
    console.log('  1. 在飞书中查看新创建的表格');
    console.log('  2. 更新 .env 文件添加新的 Table IDs');
    console.log('  3. 更新类型定义文件\n');

  } catch (error: any) {
    console.error('\n❌ 创建失败:', error.message);
    process.exit(1);
  }
}

main();
