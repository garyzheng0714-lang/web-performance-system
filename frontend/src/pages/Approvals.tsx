import { Card, Table, Tag, Button, Space, Modal, Input, message, Alert } from 'antd';
import { useEffect, useState } from 'react';
import { approveObjective, fetchPendingApprovals } from '@/api/objectives';
import { Objective } from '@/types';
import { useAppSelector } from '@/store/hooks';

export function Approvals() {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Objective[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchPendingApprovals();
      setData(res.list || []);
    } catch (error: any) {
      message.error(error.message || '加载待审批列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === '主管' || user?.role === '管理员') {
      load();
    }
    const url = new URL(window.location.href);
    const targetId = url.searchParams.get('objectiveId');
    if (targetId) {
      setHighlightId(targetId);
      url.searchParams.delete('objectiveId');
      window.history.replaceState({}, '', url.toString());
    }
  }, [user]);

  if (user?.role !== '主管' && user?.role !== '管理员') {
    return (
      <Alert
        type="warning"
        message="权限不足"
        description="仅主管或管理员可以访问该页面。"
        showIcon
      />
    );
  }

  const handleApprove = (record: Objective, approved: boolean) => {
    let comment = '';
    Modal.confirm({
      title: approved ? '确认批准该目标？' : '确认拒绝该目标？',
      content: (
        <Input.TextArea
          placeholder="审批意见（可选）"
          onChange={(e) => {
            comment = e.target.value;
          }}
          rows={3}
        />
      ),
      okText: approved ? '批准' : '拒绝',
      okButtonProps: { danger: !approved },
      cancelText: '取消',
      onOk: async () => {
        await approveObjective(record.objectiveId, { approved, comment });
        message.success(approved ? '已批准' : '已拒绝');
        load();
      },
    });
  };

  const columns = [
    { title: '员工', dataIndex: 'userName', key: 'userName' },
    { title: '目标', dataIndex: 'title', key: 'title' },
    { title: '周期', dataIndex: 'periodName', key: 'periodName' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => <Tag color="processing">{value}</Tag>,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Objective) => (
        <Space>
          <Button type="primary" size="small" onClick={() => handleApprove(record, true)}>
            批准
          </Button>
          <Button danger size="small" onClick={() => handleApprove(record, false)}>
            拒绝
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card className="fade-in" title="目标审批">
      <Table
        rowKey="objectiveId"
        columns={columns as any}
        dataSource={data}
        loading={loading}
        rowClassName={(record) => (record.objectiveId === highlightId ? 'highlight-row' : '')}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
