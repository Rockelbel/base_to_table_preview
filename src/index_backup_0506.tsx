import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { bitable, FieldType } from '@lark-base-open/js-sdk';
import { Button, Alert, Spin } from 'antd';

const App = () => {
  const [recordData, setRecordData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecordData = async () => {
    setLoading(true);
    setError(null);
    try {
      const table = await bitable.base.getActiveTable();
      const selection = await bitable.base.getSelection();
      console.log('当前选择:', selection);

      if (!selection?.recordId) {
        setError('请先选择一条记录');
        return;
      }

      var recordId = selection?.recordId;
      console.log('当前选择的记录ID:', recordId);

      const record = await table.getRecordById(recordId);
      console.log('记录详情:', record);

      const fields = await table.getFieldMetaList();
      console.log('字段信息:', fields);
      
      let result = '';
      for (const field of fields) {
        // 修改为使用 getCellValue 方法
        const value = await table.getCellValue(field.id, recordId);
        let strValue = '';
        
        // 检查字段是否存在
        if (!value) {
          console.log(`[${field.name}]`, '无数据');
          strValue=''
          continue;
        }
        // 处理不同类型字段的值
        switch (field.type) {
          case FieldType.Text:
            strValue = (value as { text: string }[]).map(v => v.text).join('\n');
            break;
          case FieldType.Number:
            strValue = String(value);
            break;
          case FieldType.DateTime:
            strValue = new Date(value as number).toLocaleString();
            break;
          case FieldType.SingleSelect:
          case FieldType.MultiSelect:
            strValue = Array.isArray(value) 
              ? (value as { text: string }[]).map(v => v.text).join(',') 
              : (value as { text: string }).text;
            break;
          case FieldType.Checkbox:
            strValue = value ? '是' : '否';
            break;
          case FieldType.Attachment:
            strValue = (value as { name: string }[]).map(v => v.name).join(',');
            break;
          default:
            strValue = JSON.stringify(value);
        }
        console.log(`[${field.name}]`, strValue);
        result += `${field.name}: ${strValue}\n`;
      }

      setRecordData(result);
      console.log('记录数据:', result);
    } catch (err) {
      console.error('获取数据失败:', err);
      setError(`获取数据失败: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // 自动监听记录变化
  useEffect(() => {
    let listener: (event: any) => Promise<void>;
    
    const setupListener = async () => {
      listener = async () => {
        await fetchRecordData();
      };
      bitable.base.onSelectionChange(listener);
    };
    
    setupListener();
    
    return () => {
      if (listener) {
        // 使用 off 方法取消监听
        bitable.base.off('selectionChange', listener);
      }
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Spin spinning={loading}>
        {error ? (
          <Alert message="错误" description={error} type="error" showIcon />
        ) : recordData ? (
          <pre style={{ whiteSpace: 'pre-wrap' }}>{recordData}</pre>
        ) : (
          <div>请选择一条记录查看数据</div>
        )}
      </Spin>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);