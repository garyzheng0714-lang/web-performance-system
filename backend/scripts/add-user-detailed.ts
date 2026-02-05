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
const employeesTableId = process.env.BITABLE_TABLE_EMPLOYEES!;

async function addUser() {
  console.log('📝 添加单个测试用户...\n');

  try {
    const testUser = {
      用户ID: 'ou_test_admin_001',
      姓名: '测试管理员',
      邮箱: 'admin@test.com',
      部门: '技术部',
      职位: 'CTO',
      主管ID: '',
      角色: '管理员',
      状态: '在职',
      创建时间: Date.now(),
    };

    console.log('准备创建用户:');
    console.log(JSON.stringify(testUser, null, 2));
    console.log('');

    const res = await client.bitable.appTableRecord.create({
      path: {
        app_token: baseToken,
        table_id: employeesTableId,
      },
      data: {
        fields: testUser,
      },
    });

    console.log('API 响应:');
    console.log(`  code: ${res.code}`);
    console.log(`  msg: ${res.msg}`);

    if (res.code !== 0) {
      console.error('❌ 创建失败!');
      console.error('完整响应:', JSON.stringify(res, null, 2));
      return;
    }

    if (res.data?.record) {
      console.log(`  ✅ 创建成功!`);
      console.log(`  Record ID: ${res.data.record.record_id}`);
      console.log('\n记录详情:');
      console.log(JSON.stringify(res.data.record, null, 2));
    }

    // 验证创建
    console.log('\n验证记录是否存在...');
    const listRes = await client.bitable.appTableRecord.list({
      path: {
        app_token: baseToken,
        table_id: employeesTableId,
      },
      params: {
        page_size: 10,
      },
    });

    console.log(`找到 ${listRes.data?.items?.length || 0} 条记录`);

  } catch (error: any) {
    console.error('❌ 操作失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

addUser();
