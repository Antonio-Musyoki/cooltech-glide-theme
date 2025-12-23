import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { CTASection } from "@/components/home/CTASection";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>CoolTech Refrigeration - Cold Rooms, Ice Machines & HVAC in Kenya</title>
        <meta
          name="description"
          content="Kenya's leading supplier of refrigeration equipment, cold rooms, ice machines, and HVAC systems. Quality products and expert services in Nairobi."
        />
        <meta
          name="keywords"
          content="Cold room masters Kenya, Cold rooms Kenya, Ice Block Machines Kenya, Ice Makers Kenya, HVAC Kenya, Refrigeration Nairobi"
        />
        <link rel="canonical" href="https://cooltechrefrigeration.co.ke" />
      </Helmet>
      <Layout>
        <HeroSection />
        <FeaturedProducts />
        <ServicesSection />
        <WhyChooseUs />
        <CTASection />
      </Layout>
    </>
  );
};

export default Index;
