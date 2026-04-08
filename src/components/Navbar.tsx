import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, Monitor, Shield, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Monitor className="h-5 w-5 text-primary" />
          </div>
          <span className="font-semibold text-sm text-foreground">IT Asset Manager</span>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/settings")}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-3.5 w-3.5 mr-1" />
              Settings
            </Button>
          )}
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 text-[11px] gap-1">
                <Shield className="h-3 w-3" />
                Admin
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[11px] gap-1">
                <User className="h-3 w-3" />
                User
              </Badge>
            )}
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {user.displayName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="h-8 text-xs text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5 mr-1" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
