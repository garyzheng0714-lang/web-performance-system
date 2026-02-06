import { Card, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, message, Alert } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { fetchPendingScores, scoreCompletion } from '@/api/completions';
import { fetchMyObjectives } from '@/api/objectives';
import { Completion, Objective } from '@/types';
import { useAppSelector } from '@/store/hooks';

export function Scoring() {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<Completion[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [scoringTarget, setScoringTarget] = useState<Completion | null>(null);
  const [form] = Form.useForm();

  const objectiveMap = useMemo(() => {
    const map: Record<string, Objective> = {};
    objectives.forEach((obj) => {
      map[obj.objectiveId] = obj;
    });
    return map;
  }, [objectives]);

  const load = async () => {
    try {
      setLoading(true);
      const [pendingRes, objectiveRes] = await Promise.all([
        fetchPendingScores(),
        fetchMyObjectives({ pageSize: 200 }),
      ]);
      setRecords(pendingRes.list || []);
      setObjectives(objectiveRes.list || []);
    } catch (error: any) {
      message.error(error.message || '加载评分列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === '主管' || user?.role === '管理员') {
      load();
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

  const columns = [
    { title: '员工', dataIndex: 'userName', key: 'userName' },
    {
      title: '目标',
      dataIndex: 'objectiveId',
      key: 'objectiveId',
      render: (value: string) => objectiveMap[value]?.title || value,
    },
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
      render: (_: any, record: Completion) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              setScoringTarget(record);
              form.resetFields();
            }}
          >
            评分
          </Button>
        </Space>
      ),
    },
  ];

  const onFinish = async (values: any) => {
    if (!scoringTarget) return;
    try {
      await scoreCompletion(scoringTarget.completionId, values);
      message.success('评分已提交');
      setScoringTarget(null);
      load();
    } catch (error: any) {
      message.error(error.message || '评分失败');
    }
  };

  return (
    <Card className="fade-in" title="评分中心">
      <Table
        rowKey="completionId"
        columns={columns as any}
        dataSource={records}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="完成情况评分"
        open={!!scoringTarget}
        onCancel={() => setScoringTarget(null)}
        onOk={() => form.submit()}
        okText="提交评分"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="supervisorScore" label="主管评分" rules={[{ required: true, message: '请输入评分' }]}>
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="calibrationScore" label="校准分">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="supervisorComment" label="主管评语">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
