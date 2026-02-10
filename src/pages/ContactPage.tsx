import { motion } from "framer-motion";
import { Mail, Linkedin, Globe, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const team = [
  {
    name: "Stewart Hartel",
    role: "Founder & CEO",
    email: "stewartph13@icloud.com",
    linkedin: "https://linkedin.com/in/yourprofile",
    bio: "Building the future of fantasy investing.",
  },
];

const ContactPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 bg-card/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">Team & Contact</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-12">
        {/* Company Info */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3"
        >
          <h2 className="text-2xl font-bold">Gridiron Grow</h2>
          <p className="text-muted-foreground leading-relaxed">
            Gridiron Grow is a fantasy-style investing league platform where users compete based on real portfolio performance. 
            We integrate with brokerage services to sync holdings and calculate weekly matchups.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <a
              href="https://gridiron-grow-game.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              gridiron-grow-game.lovable.app
            </a>
          </div>
        </motion.section>

        {/* Team */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-semibold">Our Team</h2>
          <div className="grid gap-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-xl border border-border bg-card p-6 space-y-3"
              >
                <div>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
                <div className="flex items-center gap-4">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {member.email}
                  </a>
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold">Contact Us</h2>
          <div className="rounded-xl border border-border bg-card p-6 space-y-2">
            <p className="text-sm text-muted-foreground">
              For partnerships, verification inquiries, or support:
            </p>
            <a
              href="mailto:contact@gridirongrownfl.com"
              className="flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <Mail className="h-4 w-4" />
              contact@gridirongrownfl.com
            </a>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default ContactPage;
