import { Card, Col, Row, Statistic, Typography, Progress, List, Tag, message, Skeleton } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { fetchMyObjectives } from '@/api/objectives';
import { fetchMyCompletions } from '@/api/completions';
import { useAppSelector } from '@/store/hooks';
import { Objective, Completion } from '@/types';

export function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [objectiveRes, completionRes] = await Promise.all([
          fetchMyObjectives({ pageSize: 200 }),
          fetchMyCompletions({ pageSize: 200 }),
        ]);
        setObjectives(objectiveRes.list || []);
        setCompletions(completionRes.list || []);
      } catch (error: any) {
        message.error(error.message || '加载仪表盘失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const totalObjectives = objectives.length;
    const pendingApprovals = objectives.filter((o) => o.status === '待审批').length;
    const submittedObjectives = objectives.filter((o) => o.status !== '草稿').length;
    const submittedRate = totalObjectives > 0 ? Math.round((submittedObjectives / totalObjectives) * 100) : 0;

    const pendingScores = completions.filter((c) => c.status === '已提交').length;
    const scored = completions.filter((c) => c.status === '已评分' || c.status === '已归档').length;
    const scoreRate = completions.length > 0 ? Math.round((scored / completions.length) * 100) : 0;

    return {
      totalObjectives,
      pendingApprovals,
      pendingScores,
      submittedRate,
      scoreRate,
    };
  }, [objectives, completions]);

  const reminders = useMemo(() => {
    const list = [];
    if (stats.pendingApprovals > 0) {
      list.push({ title: '你有待审批的目标', tag: '待审批' });
    }
    if (stats.pendingScores > 0) {
      list.push({ title: '你有待评分的完成情况', tag: '待评分' });
    }
    if (stats.totalObjectives === 0) {
      list.push({ title: '尚未创建考核目标', tag: '提示' });
    }
    return list;
  }, [stats]);

  return (
    <div className="fade-in">
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12} lg={6}>
              <Card>
                <Statistic title="目标总数" value={stats.totalObjectives} suffix="项" />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card>
                <Statistic title="待审批" value={stats.pendingApprovals} suffix="项" />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card>
                <Statistic title="待评分" value={stats.pendingScores} suffix="项" />
              </Card>
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Card>
                <Statistic title="提交率" value={stats.submittedRate} suffix="%" />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={14}>
              <Card title="本期进度" style={{ height: '100%' }}>
                <Typography.Text type="secondary">目标提交</Typography.Text>
                <Progress percent={stats.submittedRate} strokeColor="#e36414" />
                <Typography.Text type="secondary">评分完成</Typography.Text>
                <Progress percent={stats.scoreRate} strokeColor="#0f4c5c" />
              </Card>
            </Col>
            <Col xs={24} lg={10}>
              <Card title="提醒事项">
                <List
                  dataSource={reminders.length ? reminders : [{ title: '当前暂无提醒事项', tag: '稳定' }]}
                  renderItem={(item) => (
                    <List.Item>
                      <Typography.Text>{item.title}</Typography.Text>
                      <Tag color="processing">{item.tag}</Tag>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
          <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
            登录用户：{user?.name || '未知'}
          </Typography.Text>
        </>
      )}
    </div>
  );
}
