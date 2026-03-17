import { useNavigate } from "react-router-dom";
import { User, Building2, ArrowLeft } from "lucide-react";

export default function LoginRoleSelect() {
  const navigate = useNavigate();

  const roles = [
    {
      id: "user",
      title: "User Account",
      desc: "Classification and basic analytics",
      icon: <User size={28} />,
      path: "/login/user",
      color: "group-hover:text-primary",
    },
    {
      id: "pm",
      title: "Product Manager",
      desc: "Full administrative & Nova dashboard access",
      icon: <Building2 size={28} />,
      path: "/login/pm",
      color: "group-hover:text-accent",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold tracking-tight">Access Control</h2>
          <p className="text-muted-foreground">Define your permissions profile within LoopAI</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => navigate(role.path)}
              className="flex items-center p-6 bg-card border border-border rounded-3xl hover:bg-secondary hover:border-primary/50 transition-all text-left group"
            >
              <div className={`p-4 bg-background rounded-2xl text-muted-foreground ${role.color} transition-colors`}>
                {role.icon}
              </div>
              <div className="ml-5">
                <div className="font-bold text-xl text-foreground">{role.title}</div>
                <div className="text-sm text-muted-foreground">{role.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
