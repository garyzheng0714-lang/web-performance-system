import { Card, Col, Row, Statistic, Button, Table, message, Alert } from 'antd';
import { useEffect, useState } from 'react';
import { fetchEmployeeStats, fetchStatistics, exportData } from '@/api/admin';
import { useAppSelector } from '@/store/hooks';

interface EmployeeStat {
  userId: string;
  name: string;
  department: string;
  position: string;
  role: string;
  stats: {
    total: number;
    approved: number;
    pending: number;
    draft: number;
    completionRate: number;
  };
}

export function Admin() {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [employees, setEmployees] = useState<EmployeeStat[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      const [statRes, employeeRes] = await Promise.all([
        fetchStatistics(),
        fetchEmployeeStats({ pageSize: 50 }),
      ]);
      setStats(statRes);
      setEmployees(employeeRes.list || []);
    } catch (error: any) {
      message.error(error.message || '加载管理数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === '管理员') {
      load();
    }
  }, [user]);

  if (user?.role !== '管理员') {
    return (
      <Alert
        type="warning"
        message="权限不足"
        description="仅管理员可以访问该页面。"
        showIcon
      />
    );
  }

  const columns = [
    { title: '员工', dataIndex: 'name', key: 'name' },
    { title: '部门', dataIndex: 'department', key: 'department' },
    { title: '职位', dataIndex: 'position', key: 'position' },
    { title: '目标数', dataIndex: ['stats', 'total'], key: 'total' },
    { title: '完成率', dataIndex: ['stats', 'completionRate'], key: 'completionRate', render: (value: number) => `${value}%` },
  ];

  return (
    <div className="fade-in">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic title="在职员工" value={stats?.totalEmployees || 0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic title="本期目标" value={stats?.totalObjectives || 0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card loading={loading}>
            <Statistic
              title="整体完成率"
              value={
                stats?.totalObjectives
                  ? Math.round(((stats?.statusCount?.approved || 0) / stats.totalObjectives) * 100)
                  : 0
              }
              suffix="%"
            />
          </Card>
        </Col>
      </Row>
      <Card
        style={{ marginTop: 16 }}
        title="员工考核概览"
        extra={
          <Button
            onClick={async () => {
              try {
                const res = await exportData({ format: 'json' });
                const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `performance-export-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                message.success('导出成功');
              } catch (error: any) {
                message.error(error.message || '导出失败');
              }
            }}
          >
            导出数据
          </Button>
        }
      >
        <Table
          rowKey="userId"
          columns={columns as any}
          dataSource={employees}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
