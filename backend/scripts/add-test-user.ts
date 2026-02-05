/**
 * 添加测试用户脚本（中文字段）
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
const employeesTableId = process.env.BITABLE_TABLE_EMPLOYEES!;

async function addTestUser() {
  console.log('📝 添加测试用户到 员工信息 表...\n');

  try {
    const testUsers = [
      {
        用户ID: 'ou_test_admin',
        姓名: '测试管理员',
        邮箱: 'admin@test.com',
        部门: '技术部',
        职位: 'CTO',
        主管ID: '',
        角色: '管理员',
        状态: '在职',
        创建时间: new Date().toISOString(),
      },
      {
        用户ID: 'ou_test_supervisor',
        姓名: '测试主管',
        邮箱: 'supervisor@test.com',
        部门: '技术部',
        职位: '技术经理',
        主管ID: 'ou_test_admin',
        角色: '主管',
        状态: '在职',
        创建时间: new Date().toISOString(),
      },
      {
        用户ID: 'ou_test_employee',
        姓名: '测试员工',
        邮箱: 'employee@test.com',
        部门: '技术部',
        职位: '软件工程师',
        主管ID: 'ou_test_supervisor',
        角色: '员工',
        状态: '在职',
        创建时间: new Date().toISOString(),
      },
    ];

    for (const user of testUsers) {
      console.log(`\n创建用户: ${user.姓名} (${user.角色})...`);

      const res = await client.bitable.appTableRecord.create({
        path: {
          app_token: baseToken,
          table_id: employeesTableId,
        },
        data: {
          fields: user,
        },
      });

      if (res.data?.record) {
        console.log(`  ✅ 创建成功! Record ID: ${res.data.record.record_id}`);
      }
    }

    console.log('\n🎉 测试用户添加完成！\n');
    console.log('测试账号：');
    console.log('  1. 管理员: admin@test.com');
    console.log('  2. 主管: supervisor@test.com');
    console.log('  3. 员工: employee@test.com\n');

    console.log('下一步:');
    console.log('  1. 在飞书中查看 员工信息 表');
    console.log('  2. 获取你的真实飞书 user_id');
    console.log('  3. 更新一条记录的 用户ID 为你的真实 ID');
    console.log('  4. 测试登录: http://localhost:3001/api/auth/login\n');

  } catch (error: any) {
    console.error('❌ 添加用户失败:', error.message);
    if (error.response?.data) {
      console.error('详细错误:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

addTestUser();
