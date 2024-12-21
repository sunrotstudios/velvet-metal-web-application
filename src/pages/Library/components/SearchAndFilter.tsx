import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface SearchAndFilterProps {
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  sortBy: string;
  searchValue: string;
}

export const SearchAndFilter = ({
  onSearchChange,
  onSortChange,
  sortBy,
  searchValue,
}: SearchAndFilterProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title or artist..."
          className="pl-8"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search by title or artist"
        />
      </div>
      <Select value={sortBy} onValueChange={onSortChange} aria-label="Sort by">
        <SelectTrigger className="w-full md:w-52">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name-asc">Name (A-Z)</SelectItem>
          <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          <SelectItem value="artist-asc">Artist (A-Z)</SelectItem>
          <SelectItem value="artist-desc">Artist (Z-A)</SelectItem>
          <SelectItem value="recent">Recently Added</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
