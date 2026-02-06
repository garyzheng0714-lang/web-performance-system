import { Card, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { createCompletion, deleteCompletion, fetchMyCompletions, submitCompletion, updateCompletion } from '@/api/completions';
import { fetchMyObjectives } from '@/api/objectives';
import { Completion, Objective } from '@/types';

export function Completions() {
  const [loading, setLoading] = useState(false);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Completion | null>(null);
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
      const [completionRes, objectiveRes] = await Promise.all([
        fetchMyCompletions({ pageSize: 200 }),
        fetchMyObjectives({ pageSize: 200 }),
      ]);
      setCompletions(completionRes.list || []);
      setObjectives(objectiveRes.list || []);
    } catch (error: any) {
      message.error(error.message || '加载完成情况失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const url = new URL(window.location.href);
    if (url.searchParams.get('create')) {
      setModalOpen(true);
      url.searchParams.delete('create');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const columns = [
    {
      title: '目标',
      dataIndex: 'objectiveId',
      key: 'objectiveId',
      render: (value: string) => objectiveMap[value]?.title || value,
    },
    { title: '周期', dataIndex: 'periodName', key: 'periodName' },
    { title: '自评分', dataIndex: 'selfScore', key: 'selfScore' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => <Tag color={value === '草稿' ? 'default' : 'processing'}>{value}</Tag>,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Completion) => (
        <Space>
          <Button
            size="small"
            disabled={record.status !== '草稿'}
            onClick={() => {
              setEditing(record);
              form.setFieldsValue({
                objectiveId: record.objectiveId,
                selfAssessment: record.selfAssessment,
                actualValue: record.actualValue,
                completionRate: record.completionRate,
                selfScore: record.selfScore,
              });
              setModalOpen(true);
            }}
          >
            编辑
          </Button>
          <Button
            size="small"
            type="primary"
            disabled={record.status !== '草稿'}
            onClick={async () => {
              await submitCompletion(record.completionId);
              message.success('已提交评分');
              load();
            }}
          >
            提交
          </Button>
          <Button
            size="small"
            danger
            disabled={record.status !== '草稿'}
            onClick={() => {
              Modal.confirm({
                title: '确认删除该记录？',
                okText: '删除',
                okButtonProps: { danger: true },
                cancelText: '取消',
                onOk: async () => {
                  await deleteCompletion(record.completionId);
                  message.success('删除成功');
                  load();
                },
              });
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const onFinish = async (values: any) => {
    try {
      if (editing) {
        await updateCompletion(editing.completionId, values);
        message.success('记录已更新');
      } else {
        await createCompletion(values);
        message.success('记录已创建');
      }
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
      load();
    } catch (error: any) {
      message.error(error.message || '保存失败');
    }
  };

  return (
    <Card
      className="fade-in"
      title="完成情况填写"
      extra={
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          新增记录
        </Button>
      }
    >
      <Table
        rowKey="completionId"
        columns={columns as any}
        dataSource={completions}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? '编辑完成情况' : '新增完成情况'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="objectiveId" label="关联目标" rules={[{ required: true, message: '请选择目标' }]}>
            <Select
              options={objectives.map((obj) => ({ label: obj.title, value: obj.objectiveId }))}
            />
          </Form.Item>
          <Form.Item name="selfAssessment" label="自评内容">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="actualValue" label="实际完成值">
            <Input />
          </Form.Item>
          <Form.Item name="completionRate" label="完成率">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="selfScore" label="自评分">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
