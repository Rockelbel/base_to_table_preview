import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { bitable, FieldType } from '@lark-base-open/js-sdk';
import { Button, Alert, Spin } from 'antd';

const App = () => {
  const [recordData, setRecordData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  var tableData: Record<string, string>={}
  const fetchRecordData = async () => {
    setLoading(true);
    setError(null);
    try {
      const table = await bitable.base.getActiveTable();
      const selection = await bitable.base.getSelection();
      const recordList = await table.getRecordIdList();

      console.log('当前选择:', selection);

      if (!selection?.recordId) {
        var recordId = recordList[0];
      }else{
        var recordId = selection?.recordId;
      }
      
      console.log('当前选择的记录ID:', recordId);

      const record = await table.getRecordById(recordId);
      console.log('记录详情:', record);

      const fields = await table.getFieldMetaList();
      // console.log('字段信息:', fields);
      
      for (const field of fields) {
        // 修改为使用 getCellString 方法
        var strValue= await table.getCellString(field.id, recordId);
        console.log(`[${field.name}]`, strValue);

        // 检查字段是否存在
        if (!strValue) {
          strValue=''
          continue;
        }
        tableData[field.name] = strValue;
      }
      console.log('表格数据:', tableData);

      const config_1 = [
        [
            [4, tableData["标题"]],
            [1, "公司名称", tableData["公司全称"], "公司简称", tableData["公司简称"]],
            [2, "公司简介", tableData["公司简介"]],
            [1, "所属区域", tableData["所属区域"], "办公城市", tableData["办公城市"]],
            [1, "公司人数", tableData["公司人数"], "公司规模", tableData["公司规模"]],
            [1, "一级簇群", tableData["一级簇群"], "二级簇群", tableData["二级簇群"]],
            [2, "同二级簇群标杆客户", tableData["同二级簇群标杆客户"]],
            [2, "预估年GMV", tableData["预估年GMV"]],
            [5, ""],
            [1, "商旅系统", tableData["商旅系统"], "费控系统", tableData["费控系统"]],
            [1, "财务系统", tableData["财务系统"], "OA系统", tableData["OA系统"]],
            [2, "银企直联", tableData["银企直联"]],
            [5, ""],
            [3, 
                ["客户层级","客户职位","客户姓名","客户角色","客户手机","客户微信"],
                ["KP","财务总监","罗静","决策人","13811223344","wxluojing"],
                ["PM","行政总监","张三","影响人","17822223333","wxzhangsan"]
            ],
            [5, ""],
            [1, "线索负责人", "楚艳视", "线索负责人三级部门", "SDR组"],
            [1, "销售负责人", "石慧", "销售负责人三级部门", "FAE北京1区"],
            [2, "一次方案", "xxx一次方案"],
            [1, "新签线索来源", "市场inbound", "个人大使姓名", "张无极"],
            [1, "个人大使推荐证明", "xxx", "生态活动名称", "数字财务论坛（榕锦IT圈）-珠海"],
            [1, "生态伙伴名称", "飞书", "顾问大使名称", "张三"],
            [1, "计划拜访日期", "2023/08/01", "计划拜访方式", "面访"],
            [1, "客户参会人", "罗静 行政总，张飞 财务总监", "地址", "中国北京市朝阳区东三环南路58号"],
            [2, "拜访建议及备注(>20字)", "建议带点土特产，对方KP喜欢茶叶。"],
            [2, "潜在使用模块", "商旅/用车/用餐/商城/AI/BI"],
            [2, "需求痛点描述(>20字)", "目前的供应商，无法支持需要按不同主体/门店独立核算，出票流程繁琐，亟需减负"],
        ]
    ];
    console.log('配置数据:', config_1);

    // 调用全局函数
    if (window.renderTable) {
      window.renderTable(config_1);
    }


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
    let offListener: () => void; // 保存取消监听的函数

    const setupListener = async () => {
        listener = async () => {
            await fetchRecordData();
        };
        // 注册监听，并获取取消监听的函数
        offListener = bitable.base.onSelectionChange(listener);
    };

    setupListener(); // 调用异步函数设置监听

    return () => {
        // 在组件卸载时取消监听
        if (offListener) {
            offListener();
        }
    };
}, []);

  return (
    <div></div>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);