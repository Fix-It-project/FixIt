import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import {
	Accordion,
	AccordionContent,
	AccordionTrigger,
} from "@/src/components/ui/accordion";
import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";

interface FaqItem {
	readonly q: string;
	readonly a: string;
}

/**
 * Role-aware FAQ / app-rules list rendered as a collapsible accordion (one
 * question open at a time). Answers explain real, enforced app rules — derived
 * from the backend — for customers and technicians.
 */
export function FaqContent({
	userType,
}: {
	readonly userType: "user" | "technician";
}) {
	const { t } = useTranslation("faq");
	const themeColors = useThemeColors();
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const items = (userType === "technician"
		? t("technician.items", { returnObjects: true })
		: t("user.items", { returnObjects: true })) as unknown as FaqItem[];

	return (
		<ScrollView
			className="flex-1 bg-surface"
			contentContainerClassName="px-screen-x py-stack-md"
			showsVerticalScrollIndicator={false}
		>
			{items.map((item, index) => {
				const open = openIndex === index;
				return (
					<View key={item.q}>
						{index > 0 ? <Separator /> : null}
						<Accordion
							expanded={open}
							onExpandedChange={(next) => setOpenIndex(next ? index : null)}
						>
							<AccordionTrigger className="flex-row items-center gap-stack-md py-list-row-comfortable-y active:opacity-70">
								<Text
									variant="body"
									className="flex-1 font-semibold text-content"
								>
									{item.q}
								</Text>
								{open ? (
									<ChevronUp
										size={20}
										color={themeColors.textSecondary}
										strokeWidth={2}
									/>
								) : (
									<ChevronDown
										size={20}
										color={themeColors.textSecondary}
										strokeWidth={2}
									/>
								)}
							</AccordionTrigger>
							<AccordionContent>
								<Text
									variant="bodySm"
									className="pb-list-row-comfortable-y text-content-secondary"
								>
									{item.a}
								</Text>
							</AccordionContent>
						</Accordion>
					</View>
				);
			})}
		</ScrollView>
	);
}
