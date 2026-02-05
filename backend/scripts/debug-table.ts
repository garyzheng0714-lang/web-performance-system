import * as dotenv from 'dotenv';
import * as lark from '@larksuiteoapi/node-sdk';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function debugTable() {
  const client = new lark.Client({
    appId: process.env.FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET,
    appType: lark.AppType.SelfBuild,
    domain: lark.Domain.Feishu,
  });

  const appToken = process.env.BITABLE_APP_TOKEN;
  const tableId = process.env.BITABLE_TABLE_EMPLOYEES;

  console.log('🔍 调试员工信息表...\n');

  try {
    // 1. 列出所有表
    console.log('1. 获取所有表...');
    const tablesRes = await client.bitable.appTable.list({
      path: { app_token: appToken },
    });

    if (tablesRes.data?.items) {
      console.log('\n可用的表:');
      tablesRes.data.items.forEach((table: any) => {
        console.log(`  - ${table.name} (${table.table_id})`);
      });
    }

    // 2. 获取字段信息
    console.log('\n2. 获取员工信息表的字段...');
    const fieldsRes = await client.bitable.appTableField.list({
      path: {
        app_token: appToken,
        table_id: tableId,
      },
    });

    if (fieldsRes.data?.items) {
      console.log('\n字段列表:');
      fieldsRes.data.items.forEach((field: any) => {
        console.log(`  - ${field.field_name} (${field.field_id}) - ${field.type}`);
      });
    }

    // 3. 获取记录
    console.log('\n3. 获取所有记录...');
    const recordsRes = await client.bitable.appTableRecord.list({
      path: {
        app_token: appToken,
        table_id: tableId,
      },
      params: {
        page_size: 10,
      },
    });

    console.log('\nAPI响应:');
    console.log(`  code: ${recordsRes.code}`);
    console.log(`  msg: ${recordsRes.msg}`);
    console.log(`  记录数: ${recordsRes.data?.items?.length || 0}`);

    if (recordsRes.data?.items && recordsRes.data.items.length > 0) {
      console.log('\n第一条记录:');
      console.log(JSON.stringify(recordsRes.data.items[0], null, 2));
    }

  } catch (error: any) {
    console.error('❌ 调试失败:', error.message);
    if (error.response) {
      console.error('错误响应:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugTable();
