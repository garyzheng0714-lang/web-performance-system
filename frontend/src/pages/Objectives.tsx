import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, DatePicker, InputNumber, message, Segmented } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { createObjective, deleteObjective, fetchMyObjectives, submitObjective, updateObjective } from '@/api/objectives';
import { Objective } from '@/types';

export function Objectives() {
  const [loading, setLoading] = useState(false);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Objective | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [keyword, setKeyword] = useState('');
  const [form] = Form.useForm();

  const load = async (overrideKeyword?: string) => {
    try {
      setLoading(true);
      const res = await fetchMyObjectives({
        status: statusFilter,
        keyword: (overrideKeyword ?? keyword) || undefined,
        pageSize: 200,
      });
      setObjectives(res.list || []);
    } catch (error: any) {
      message.error(error.message || '加载目标失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const columns = useMemo(() => [
    { title: '目标', dataIndex: 'title', key: 'title' },
    { title: '周期', dataIndex: 'periodName', key: 'periodName' },
    { title: '权重', dataIndex: 'weight', key: 'weight', render: (value: number) => `${value}%` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => <Tag color={value === '草稿' ? 'default' : value === '待审批' ? 'processing' : 'success'}>{value}</Tag>,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Objective) => (
        <Space>
          <Button
            size="small"
            disabled={record.status !== '草稿'}
            onClick={() => {
              setEditing(record);
              form.setFieldsValue({
                title: record.title,
                description: record.description,
                periodId: record.periodId,
                periodName: record.periodName,
                type: record.type,
                weight: record.weight,
                target: record.target,
                priority: record.priority,
                dueDate: record.dueDate ? dayjs(record.dueDate) : undefined,
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
              try {
                await submitObjective(record.objectiveId);
                message.success('已提交审批');
                load();
              } catch (error: any) {
                message.error(error.message || '提交失败');
              }
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
                title: '确认删除该目标？',
                content: '删除后不可恢复。',
                okText: '删除',
                okButtonProps: { danger: true },
                cancelText: '取消',
                onOk: async () => {
                  await deleteObjective(record.objectiveId);
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
  ], [form]);

  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      };
      if (editing) {
        await updateObjective(editing.objectiveId, payload);
        message.success('目标已更新');
      } else {
        await createObjective(payload);
        message.success('目标已创建');
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
      title="目标管理"
      extra={
        <Space>
          <Input.Search
            placeholder="搜索目标"
            allowClear
            onSearch={(value) => {
              setKeyword(value);
              load(value);
            }}
            style={{ width: 200 }}
          />
          <Button
            type="primary"
            onClick={() => {
              setEditing(null);
              form.resetFields();
              setModalOpen(true);
            }}
          >
            新建目标
          </Button>
        </Space>
      }
    >
      <Space style={{ marginBottom: 16 }}>
        <Segmented
          options={['全部', '草稿', '待审批', '已批准', '已拒绝']}
          onChange={(value) => {
            setStatusFilter(value === '全部' ? undefined : (value as string));
          }}
        />
      </Space>
      <Table
        rowKey="objectiveId"
        columns={columns as any}
        dataSource={objectives}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editing ? '编辑目标' : '新建目标'}
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
          <Form.Item name="title" label="目标标题" rules={[{ required: true, message: '请输入目标标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="目标描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="periodName" label="周期名称">
            <Input placeholder="如 2026 Q1" />
          </Form.Item>
          <Form.Item name="periodId" label="周期ID">
            <Input placeholder="如 2026Q1" />
          </Form.Item>
          <Form.Item name="type" label="目标类型">
            <Select
              options={[
                { label: '业务目标', value: '业务目标' },
                { label: '能力目标', value: '能力目标' },
                { label: '发展目标', value: '发展目标' },
              ]}
            />
          </Form.Item>
          <Form.Item name="weight" label="权重">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="target" label="目标值">
            <Input />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select
              options={[
                { label: '高', value: '高' },
                { label: '中', value: '中' },
                { label: '低', value: '低' },
              ]}
            />
          </Form.Item>
          <Form.Item name="dueDate" label="截止日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
