import { ClipboardList, type LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import PageHeader from "@/src/components/PageHeader";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { Colors } from "@/src/lib/theme";

interface Props {
  readonly categoryId: string | null | undefined;
  readonly onBack: () => void;
  readonly title: string;
}

export default function DetailHeader({ categoryId, onBack, title }: Props) {
  const category = categoryId ? CATEGORIES.find((c) => c.id === categoryId) : undefined;
  const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
  const categoryColor = category?.color ?? Colors.primary;

  return (
    <PageHeader
      title={title}
      onBackPress={onBack}
      rightContent={(
        <View
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${categoryColor}18` }}
        >
          <CategoryIcon size={18} color={categoryColor} strokeWidth={1.8} />
        </View>
      )}
    />
  );
}
