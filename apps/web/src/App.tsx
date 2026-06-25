import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Categories } from "@/components/sections/Categories";
import { Faq } from "@/components/sections/Faq";
import { FeatureShowcase } from "@/components/sections/FeatureShowcase";
import { FinalCta } from "@/components/sections/FinalCta";
import { ForTechnicians } from "@/components/sections/ForTechnicians";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";

export default function App() {
	return (
		<>
			<a
				href="#features"
				className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:font-semibold focus:text-primary-foreground"
			>
				Skip to content
			</a>
			<Navbar />
			<main>
				<Hero />
				<Categories />
				<HowItWorks />
				<FeatureShowcase />
				<ForTechnicians />
				<Faq />
				<FinalCta />
			</main>
			<Footer />
		</>
	);
}
