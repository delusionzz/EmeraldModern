import { useState, useEffect } from "react";
import { useSettings } from "@/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import GridPattern from "../ui/grid-pattern";
import { cn } from "@/lib/utils";
const OnBoarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const settings = useSettings();

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("onboardingCompleted");
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleSiteTypeSelection = (siteType: "default" | "browser") => {
    settings.setSiteType(siteType);
    localStorage.setItem("onboardingCompleted", "true");
    setShowOnboarding(false);
  };

  if (!showOnboarding) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-md">
      <GridPattern
        width={30}
        height={30}
        x={-1}
        y={-1}
        strokeDasharray={"1 2"}
        className={cn(
          `[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] fixed inset-0 z-0 opacity-40`
        )}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl p-4"
      >
        <Card className="border-border/30 bg-card/80 backdrop-blur-xl shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-6">
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Welcome to Emerald
            </CardTitle>
            <CardDescription className="text-lg">
              Choose how you'd like to experience Emerald
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className="h-full cursor-pointer border-border/30 hover:border-primary/50 transition-all"
                onClick={() => handleSiteTypeSelection("default")}
              >
                <CardHeader>
                  <CardTitle>Default Mode</CardTitle>
                  <CardDescription>
                    Clean, minimalist interface with a search-focused experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-40 bg-gradient-to-br from-primary/5 to-primary/20 rounded-lg flex items-center justify-center">
                    <div className="w-3/4 h-8 bg-white/20 rounded-full shadow-lg"></div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSiteTypeSelection("default")}
                  >
                    Select Default Mode
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className="h-full cursor-pointer border-border/30 hover:border-primary/50 transition-all"
                onClick={() => handleSiteTypeSelection("browser")}
              >
                <CardHeader>
                  <CardTitle>Browser Mode</CardTitle>
                  <CardDescription>
                    Full browser experience with tabs and advanced features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-40 bg-gradient-to-br from-primary/5 to-primary/20 rounded-lg flex flex-col items-center justify-start p-2">
                    <div className="w-full h-8 bg-white/20 rounded-t-lg flex items-center px-2 gap-1">
                      <div className="w-16 h-6 bg-white/30 rounded-md"></div>
                      <div className="w-16 h-6 bg-white/10 rounded-md"></div>
                    </div>
                    <div className="w-full h-8 bg-white/10 rounded-md mt-2"></div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => handleSiteTypeSelection("browser")}
                  >
                    Select Browser Mode
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default OnBoarding;
