import { Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqs } from "@/constants/content/faqs";
import { cn } from "@/lib/utils";

export function Faq() {
	const [openIdx, setOpenIdx] = useState<number>(0);
	const reduce = useReducedMotion();

	return (
		<section id="faq" className="bg-background py-24 sm:py-32">
			<Container>
				<SectionHeading eyebrow="FAQ" title="Good questions, clear answers" />

				<div className="mx-auto mt-14 max-w-2xl">
					{faqs.map((faq, i) => {
						const isOpen = openIdx === i;
						return (
							<div key={faq.q} className="border-border border-b">
								<h3>
									<button
										type="button"
										onClick={() => setOpenIdx(isOpen ? -1 : i)}
										aria-expanded={isOpen}
										className="flex w-full items-center justify-between gap-4 py-5 text-left"
									>
										<span className="font-semibold text-foreground text-lg">
											{faq.q}
										</span>
										<Plus
											aria-hidden
											className={cn(
												"h-5 w-5 shrink-0 text-primary transition-transform duration-300",
												isOpen && "rotate-45",
											)}
										/>
									</button>
								</h3>
								<AnimatePresence initial={false}>
									{isOpen ? (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{
												duration: reduce ? 0 : 0.28,
												ease: "easeInOut",
											}}
											className="overflow-hidden"
										>
											<p className="text-pretty pr-9 pb-5 text-muted-foreground leading-relaxed">
												{faq.a}
											</p>
										</motion.div>
									) : null}
								</AnimatePresence>
							</div>
						);
					})}
				</div>
			</Container>
		</section>
	);
}
