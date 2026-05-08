import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body-md">
      <Navbar transparent={true} />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-[700px] flex items-center overflow-hidden bg-gray-900">
          <img 
            alt="Professional chef cooking in a dark modern kitchen" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 z-0" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSxj0lPbZHRk1En9HQH-gNPAuEDHIpm_mHaAqCCqzWOPZsUXvhK7j7ZYvQHH6C8qYNLEaE7k3bF1VAs765-Q95irq8uEIE0NcJx-NMre9xb3yEgWes4zA1rN8cyaxmud4jFIz_Kv7JJAdY3QMzoOIFK22UmkHRbqfu1YVeMqayrmpMnz4tCNwELB2pL8OhfL5OQZFedD6XmADWRnXJSe64qiytV6DJmwDpPUas6npSC26yJyJvAe0aQBTVFKEpLIHCQCCvm3BAa34"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/60 to-transparent z-0"></div>
          <div className="max-w-[var(--spacing-container-max)] mx-auto px-6 relative z-10 w-full pt-20">
            <div className="max-w-2xl space-y-8">
              <h1 className="font-display-lg text-5xl md:text-6xl text-white leading-tight">
                Book Professional Cook <br/>
                <span className="text-orange-500">At Your Home.</span>
              </h1>
              <p className="text-body-lg text-gray-200 text-xl max-w-lg font-light">
                From daily meals to special occasions
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/search" className="bg-orange-500 text-white px-8 py-3.5 rounded-xl font-bold text-body-md hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-500/20 inline-block">
                  Find Cook
                </Link>
                <Link to="/signup" className="bg-transparent border-2 border-white text-white px-8 py-3.5 rounded-xl font-bold text-body-md hover:bg-white/10 transition-all active:scale-95 backdrop-blur-sm inline-block">
                  Become a Cook
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-xl bg-surface">
          <div className="max-w-[var(--spacing-container-max)] mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-headline-md text-on-background mb-4">Simple Steps to Gourmet Dining</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">We've streamlined the process of finding professional culinary talent for your home.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="group text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-[1rem] shadow-sm border border-gray-100 flex items-center justify-center mx-auto group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl" data-icon="search">search</span>
                </div>
                <h3 className="font-title-sm text-on-background">Search</h3>
                <p className="text-body-md text-on-surface-variant">Browse through our curated list of professional cooks based on cuisine, experience, and ratings.</p>
              </div>
              <div className="group text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-[1rem] shadow-sm border border-gray-100 flex items-center justify-center mx-auto group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl" data-icon="calendar_today">calendar_today</span>
                </div>
                <h3 className="font-title-sm text-on-background">Book</h3>
                <p className="text-body-md text-on-surface-variant">Select your preferred date and time. Securely book and communicate directly with your chosen chef.</p>
              </div>
              <div className="group text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-[1rem] shadow-sm border border-gray-100 flex items-center justify-center mx-auto group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl" data-icon="star">star</span>
                </div>
                <h3 className="font-title-sm text-on-background">Enjoy</h3>
                <p className="text-body-md text-on-surface-variant">Relax and savor a professionally prepared meal in the comfort of your own home.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Cooks */}
        <section className="py-xl">
          <div className="max-w-[var(--spacing-container-max)] mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-headline-md text-on-background">Featured Professional Cooks</h2>
                <p className="text-on-surface-variant mt-2">The highest rated culinary experts in your area.</p>
              </div>
              <Link to="/search" className="text-primary font-bold flex items-center gap-2 hover:underline">
                View All
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              {[
                { name: "Chef Elena Rossi", exp: "12 years experience", rating: "4.9", tags: ["Italian", "Seafood"], img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC79uLEguuD11B4QRQH0FY7WyCdxh9dlLCSACIMIua5ACOtXbKbIcu_lOFAQ3eVVJgMM39JlZkHJKXyCksJfbpipGzjHCtcdTkwtFn0zhSRlTNWnSxPaHhnBbo5wqiUla9eZUUSqRdJmgW_JZyib4_iBl48i39h1u22Sr5WYL1-ZiG-5XnjTVP41KGr3Meu2sP3RIQLkCwL_B7IOL2iUuORttlVFihxBi9LIveYrlh0wN_D1dmmRFipi2hDfDWRDx7JDX-Pf7IlaOY" },
                { name: "Chef Marcus Chen", exp: "8 years experience", rating: "5.0", tags: ["Asian Fusion", "Pastry"], img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNje2Pv1N4vOT-qj7NJByrN3SEnxaJ_T0W5UrnEvT3T6anwjFRGI2bYMjqQJr9v3i-dhJHOuokug8WEobdy9UPgGu-03k0KYkVeQiWgv8yOkg9PPey-gzIjQXBBQP0xr5G0TPviMcgUYEcVa6PVVYgnk567Sn88-qD10oNV9S3-TcAkbeDtUWo08hx4rbkSrVLDmsAWAIOla_UX_P7MxGqxJn8QwRJPuUaNsUfRJZeFZSh7zaQB6g21ig12yJVs71GREjK5n9UIHw" },
                { name: "Chef Sarah Jenkins", exp: "15 years experience", rating: "4.8", tags: ["Plant-Based", "Organic"], img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfK8jR-TjXaBmFE5hWWo-MhbOkBxCrrCJvLrzI6-kzp9URpQq_YWOzjzGhojYsWre8hIN1q45Elh9ngdMTvEpcT_zaP6lghEjPO8haJHgQ6zdULRq_2Fkb0n2qorDxzcEsSmJvUCQdB9j2ZG_kDdu9hJCEPd4Ez3bcNX6arZ6Vyns8QxyUzes7AJRep5tcxcoNDH_xxWBMV0OwMq0PO_2tBCPBmZX9iPsKqWbykwI1Xq6XamFXcIKYPcuf8U3ubjWE6r3Hb7_NVTU" },
                { name: "Chef David Miller", exp: "20 years experience", rating: "4.9", tags: ["French", "Grill"], img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDX-2Alf5Ac6GIzOupxwD0GBjMDY1qO4KXuN6zDQRFr_G9gOcgYhzbRJgNjvJ3AaalND5lMMDCkMGSCLfZIg_5tVlmd2gprZ0VfU4qjriMt7n2Unym8SmLtI9YuXHlK2n5JcODtQ_hNckWJquu3_r8KOL_qCTwM5EnhbEBQD5J5CE7LhPs_S2RaSt5h2TJbcHxPTTwYBSTKR-bNEeRoQ_rJbsjAdK2nYxwzGxiTP_t6MmbA4bpHXrJADyNdlXclJcQzHu4Eoo95FX4" }
              ].map((cook, idx) => (
                <div key={idx} className="bg-white rounded-[1rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all">
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={cook.img} alt={cook.name} />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-orange-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-xs font-bold text-on-background">{cook.rating}</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-on-background">{cook.name}</h4>
                        <p className="text-caption text-on-surface-variant">{cook.exp}</p>
                      </div>
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cook.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Become a Cook CTA */}
        <section className="py-xl">
          <div className="max-w-[var(--spacing-container-max)] mx-auto px-6">
            <div className="relative bg-[#002114] overflow-hidden rounded-[2rem] p-12 lg:p-20 flex flex-col lg:flex-row items-center gap-12">
              <div className="relative z-10 space-y-6 lg:w-3/5 text-center lg:text-left">
                <h2 className="text-white font-display-lg text-4xl lg:text-5xl leading-tight">
                  Turn Your Culinary Passion into a Career.
                </h2>
                <p className="text-emerald-100 text-body-lg max-w-xl">
                  Join our community of professional cooks. Manage your own schedule, set your rates, and showcase your skills to thousands of local clients.
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                  <Link to="/signup" className="bg-primary text-white px-10 py-4 rounded-xl font-bold text-body-md hover:bg-emerald-500 transition-all active:scale-95">
                    Become a Cook
                  </Link>
                  <button className="bg-transparent border border-white/30 text-white px-10 py-4 rounded-xl font-bold text-body-md hover:bg-white/10 transition-all">
                    Learn More
                  </button>
                </div>
              </div>
              <div className="relative lg:w-2/5 flex justify-center">
                <div className="relative w-64 h-64 lg:w-80 lg:h-80 bg-emerald-500/20 rounded-full border border-emerald-500/30 flex items-center justify-center p-4">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-emerald-500/50">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuApINDWc4yNzE0BqoqWPNNemcIkMEkaaLh8pCldp0nSzk7PVnH9DVj04wmLLfSTmNFao71VSbATHtbr07Kt6c4HdbH-yhvpx97mMkA8VLN2kbr2uFHUIXhAQ_wV2BKTfmEp4Q0PThUfq2cpYFABD2jdAA45M9vLSovcgMVdVbjXQ6u5mlwOtUjLdXixXrVxKkg_smvd7o8FE2k2m9ND3OTClPVHCm--6Pz774ZtXKOkNHJM6Oowv3kaPBt2sOLcOy16TWiK2qAOz2Q" alt="Chef tossing fresh greens" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-white border-t border-gray-100">
        <div className="max-w-[var(--spacing-container-max)] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <span className="font-bold text-gray-900 text-xl">ChefConnect</span>
            <p className="text-gray-500 max-w-xs text-sm">
                © 2024 ChefConnect. Culinary excellence delivered. Bringing professional dining experiences to your home kitchen.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-600 transition-colors">
                <span className="material-symbols-outlined text-xl">share</span>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-4">
              <h5 className="font-bold text-gray-900 uppercase tracking-wider text-xs">Platform</h5>
              <ul className="space-y-2">
                <li><Link to="/search" className="text-gray-500 hover:text-emerald-600 transition-colors">Find Cooks</Link></li>
                <li><Link to="#" className="text-gray-500 hover:text-emerald-600 transition-colors">How it Works</Link></li>
                <li><Link to="/signup" className="text-gray-500 hover:text-emerald-600 transition-colors">Become a Cook</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold text-gray-900 uppercase tracking-wider text-xs">Legal</h5>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-500 hover:text-emerald-600 transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="text-gray-500 hover:text-emerald-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
