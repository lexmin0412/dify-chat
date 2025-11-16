import { Button, Input, Select } from 'antd';
import { TagOutlined } from '@ant-design/icons';
import { FilterParams, TagCategory, SortByType } from '../types';

interface AppMarketFilterProps {
  filterParams: FilterParams;
  tagCategories: TagCategory;
  onFilterChange: (newParams: Partial<FilterParams>) => void;
}

const { Option } = Select;

const AppMarketFilter = ({ 
  filterParams, 
  tagCategories, 
  onFilterChange 
}: AppMarketFilterProps) => {
  const { searchTerm, selectedTags, sortBy } = filterParams;

  // 搜索处理
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ searchTerm: e.target.value });
  };

  // 标签选择处理
  const handleTagSelect = (value: string[]) => {
    onFilterChange({ selectedTags: value });
  };

  // 排序处理
  const handleSortChange = (newSortBy: SortByType) => {
    onFilterChange({ sortBy: newSortBy });
  };

  return (
    <div className="px-3 md:px-6 mb-6">
      <div className="mb-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* 排序按钮 */}
          <div className="flex gap-2">
            <Button
              type={sortBy === 'comprehensive' ? 'primary' : 'default'}
              onClick={() => handleSortChange('comprehensive')}
              size="middle"
            >
              综合排序
            </Button>
            <Button
              type={sortBy === 'usageCount' ? 'primary' : 'default'}
              onClick={() => handleSortChange('usageCount')}
              size="middle"
            >
              最多使用
            </Button>
            <Button
              type={sortBy === 'conversationCount' ? 'primary' : 'default'}
              onClick={() => handleSortChange('conversationCount')}
              size="middle"
            >
              最多对话
            </Button>
          </div>
          
          {/* 标签和搜索 */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* 标签下拉筛选 */}
            <Select
              mode="multiple"
              placeholder="全部标签"
              style={{ width: 200 }}
              value={selectedTags}
              onChange={handleTagSelect}
            >
              {Object.entries(tagCategories).map(([category, tags]) => (
                <>
                  <Option key={`${category}-disabled`} disabled>{category}</Option>
                  {tags.map(tag => (
                    <Option key={tag} value={tag}>
                      {tag}
                    </Option>
                  ))}
                </>
              ))}
            </Select>
            
            {/* 搜索框 */}
            <Input
              placeholder="搜索应用、作者或描述"
              value={searchTerm}
              onChange={handleSearch}
              style={{ width: 300 }}
              prefix={<TagOutlined />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppMarketFilter;