/**
 * 飞书多维表格初始化脚本（中文字段）
 */

import * as lark from '@larksuiteoapi/node-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// 加载环境变量
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

// 中文表结构定义
const tableSchemas: TableSchema[] = [
  {
    name: '员工信息',
    fields: [
      { field_name: '用户ID', type: 1 },
      { field_name: '姓名', type: 1 },
      { field_name: '邮箱', type: 1 },
      {
        field_name: '部门',
        type: 3,
        property: {
          options: [
            { name: '技术部' },
            { name: '产品部' },
            { name: '运营部' },
            { name: '市场部' },
            { name: '行政部' },
            { name: '财务部' },
            { name: '人事部' },
          ],
        },
      },
      { field_name: '职位', type: 1 },
      { field_name: '主管ID', type: 1 },
      {
        field_name: '角色',
        type: 3,
        property: {
          options: [
            { name: '员工' },
            { name: '主管' },
            { name: '管理员' },
          ],
        },
      },
      {
        field_name: '状态',
        type: 3,
        property: {
          options: [
            { name: '在职' },
            { name: '离职' },
          ],
        },
      },
      { field_name: '入职日期', type: 5 },
      { field_name: '创建时间', type: 5 },
    ],
  },
  {
    name: '考核目标',
    fields: [
      { field_name: '目标ID', type: 1 },
      { field_name: '用户ID', type: 1 },
      { field_name: '姓名', type: 1 },
      { field_name: '周期ID', type: 1 },
      { field_name: '周期名称', type: 1 },
      { field_name: '目标标题', type: 1 },
      { field_name: '目标描述', type: 1 },
      {
        field_name: '目标类型',
        type: 3,
        property: {
          options: [
            { name: '业务目标' },
            { name: '能力目标' },
            { name: '发展目标' },
          ],
        },
      },
      { field_name: '权重', type: 2 },
      { field_name: '目标值', type: 1 },
      {
        field_name: '优先级',
        type: 3,
        property: {
          options: [
            { name: '高' },
            { name: '中' },
            { name: '低' },
          ],
        },
      },
      { field_name: '截止日期', type: 5 },
      {
        field_name: '状态',
        type: 3,
        property: {
          options: [
            { name: '草稿' },
            { name: '待审批' },
            { name: '已批准' },
            { name: '已拒绝' },
            { name: '已暂停' },
            { name: '已取消' },
          ],
        },
      },
      { field_name: '提交时间', type: 5 },
      { field_name: '审批时间', type: 5 },
      { field_name: '审批人ID', type: 1 },
      { field_name: '审批人姓名', type: 1 },
      { field_name: '主管意见', type: 1 },
      { field_name: '父目标ID', type: 1 },
      { field_name: '创建时间', type: 5 },
      { field_name: '更新时间', type: 5 },
    ],
  },
  {
    name: '完成情况',
    fields: [
      { field_name: '完成ID', type: 1 },
      { field_name: '目标ID', type: 1 },
      { field_name: '用户ID', type: 1 },
      { field_name: '姓名', type: 1 },
      { field_name: '周期ID', type: 1 },
      { field_name: '周期名称', type: 1 },
      { field_name: '自评内容', type: 1 },
      { field_name: '实际完成值', type: 1 },
      { field_name: '完成率', type: 2 },
      { field_name: '自评分', type: 2 },
      { field_name: '主管评分', type: 2 },
      { field_name: '校准分', type: 2 },
      { field_name: '主管评语', type: 1 },
      { field_name: '证明材料', type: 1 },
      {
        field_name: '状态',
        type: 3,
        property: {
          options: [
            { name: '草稿' },
            { name: '已提交' },
            { name: '复核中' },
            { name: '已评分' },
            { name: '申诉中' },
            { name: '已校准' },
            { name: '已归档' },
          ],
        },
      },
      { field_name: '提交时间', type: 5 },
      { field_name: '评分时间', type: 5 },
      { field_name: '创建时间', type: 5 },
      { field_name: '更新时间', type: 5 },
    ],
  },
  {
    name: '审批记录',
    fields: [
      { field_name: '审批ID', type: 1 },
      {
        field_name: '审批类型',
        type: 3,
        property: {
          options: [
            { name: '目标审批' },
            { name: '评分审批' },
            { name: '修改申请' },
            { name: '延期申请' },
            { name: '申诉审批' },
          ],
        },
      },
      { field_name: '关联ID', type: 1 },
      { field_name: '关联类型', type: 1 },
      { field_name: '申请人ID', type: 1 },
      { field_name: '申请人姓名', type: 1 },
      { field_name: '审批人ID', type: 1 },
      { field_name: '审批人姓名', type: 1 },
      {
        field_name: '状态',
        type: 3,
        property: {
          options: [
            { name: '待审批' },
            { name: '已批准' },
            { name: '已拒绝' },
          ],
        },
      },
      { field_name: '审批意见', type: 1 },
      { field_name: '备注', type: 1 },
      { field_name: '提交时间', type: 5 },
      { field_name: '处理时间', type: 5 },
    ],
  },
  {
    name: '系统配置',
    fields: [
      { field_name: '配置键', type: 1 },
      { field_name: '配置值', type: 1 },
      { field_name: '配置类型', type: 1 },
      { field_name: '配置分类', type: 1 },
      { field_name: '配置说明', type: 1 },
      { field_name: '是否可编辑', type: 4 },
      { field_name: '创建时间', type: 5 },
      { field_name: '更新时间', type: 5 },
    ],
  },
];

async function listTables() {
  console.log('📋 查看现有表格...\n');
  try {
    const res = await client.bitable.appTable.list({
      path: {
        app_token: baseToken,
      },
    });

    if (res.data?.items && res.data.items.length > 0) {
      console.log(`找到 ${res.data.items.length} 张表:\n`);
      res.data.items.forEach((table: any) => {
        console.log(`  - ${table.name} (ID: ${table.table_id})`);
      });
      console.log('');
      return res.data.items;
    } else {
      console.log('  当前多维表格为空\n');
      return [];
    }
  } catch (error: any) {
    console.error('❌ 查看表格失败:', error.message);
    throw error;
  }
}

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
    console.error('  ❌ 创建失败:', error.message);
    if (error.response?.data) {
      console.error('  详细错误:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

async function updateEnvFile(tableIds: Record<string, string>) {
  console.log('📝 更新 .env 文件中的 Table IDs...\n');

  const envPath = path.join(__dirname, '../.env');
  let envContent = fs.readFileSync(envPath, 'utf-8');

  envContent = envContent.replace(
    /BITABLE_TABLE_EMPLOYEES=.*/,
    `BITABLE_TABLE_EMPLOYEES=${tableIds['员工信息'] || 'not_created'}`
  );
  envContent = envContent.replace(
    /BITABLE_TABLE_OBJECTIVES=.*/,
    `BITABLE_TABLE_OBJECTIVES=${tableIds['考核目标'] || 'not_created'}`
  );
  envContent = envContent.replace(
    /BITABLE_TABLE_COMPLETIONS=.*/,
    `BITABLE_TABLE_COMPLETIONS=${tableIds['完成情况'] || 'not_created'}`
  );
  envContent = envContent.replace(
    /BITABLE_TABLE_APPROVALS=.*/,
    `BITABLE_TABLE_APPROVALS=${tableIds['审批记录'] || 'not_created'}`
  );
  envContent = envContent.replace(
    /BITABLE_TABLE_CONFIG=.*/,
    `BITABLE_TABLE_CONFIG=${tableIds['系统配置'] || 'not_created'}`
  );

  fs.writeFileSync(envPath, envContent);
  console.log('  ✅ .env 文件已更新!\n');
}

async function main() {
  console.log('🚀 飞书多维表格初始化脚本（中文字段）\n');
  console.log(`App Token: ${baseToken}\n`);

  try {
    const existingTables = await listTables();
    const existingTableNames = existingTables.map((t: any) => t.name);

    const tableIds: Record<string, string> = {};

    for (const schema of tableSchemas) {
      if (existingTableNames.includes(schema.name)) {
        console.log(`⏭️  表格 "${schema.name}" 已存在，跳过创建\n`);
        const existing = existingTables.find((t: any) => t.name === schema.name);
        if (existing) {
          tableIds[schema.name] = existing.table_id;
        }
      } else {
        const tableId = await createTable(schema);
        tableIds[schema.name] = tableId;
      }
    }

    await updateEnvFile(tableIds);

    console.log('🎉 初始化完成！\n');
    console.log('表格列表:');
    Object.entries(tableIds).forEach(([name, id]) => {
      console.log(`  ✅ ${name}: ${id}`);
    });

    console.log('\n下一步:');
    console.log('  1. 在飞书中查看创建的表格');
    console.log('  2. 在 员工信息 表中添加测试用户');
    console.log('  3. 启动后端服务: npm run start:dev');
    console.log('  4. 测试登录功能\n');

  } catch (error: any) {
    console.error('\n❌ 初始化失败:', error.message);
    process.exit(1);
  }
}

main();
