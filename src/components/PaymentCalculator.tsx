import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { toast } from "sonner@2.0.3";
import { useSpotifyData } from "../hooks/useSpotifyData";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwa2uXAmCGLYap4cJIHksDfun3xXdSRQp7F7oCSJt61IniPlIGQ4pekIVIU-0wgysp8Xw/exec";

export function PaymentCalculator() {
  const {
    data,
    loading,
    processedPeriods,
    currentPeriod,
    nextPeriod,
    currentPeriodIndex,
  } = useSpotifyData();
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [includeCurrentSemester, setIncludeCurrentSemester] = useState(true);
  const [wantsReminders, setWantsReminders] = useState(false);
  const [email, setEmail] = useState("");
  const [owedAmount, setOwedAmount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedPerson && data && processedPeriods.length > 0) {
      const member = data.members.find((m) => m.name === selectedPerson);
      if (member) {
        // Find the last paid period
        let lastPaidIndex = -1;
        for (let i = member.data.length - 1; i >= 0; i--) {
          if (member.data[i] === 1) {
            lastPaidIndex = i;
            break;
          }
        }

        // Calculate owed amount
        let total = 0;
        const targetIndex = includeCurrentSemester
          ? currentPeriodIndex
          : currentPeriodIndex - 1;

        // Sum up the prices from the period after they last paid to the target period
        for (let i = lastPaidIndex + 1; i <= targetIndex; i++) {
          if (i >= 0 && i < processedPeriods.length) {
            total += processedPeriods[i].price;
          }
        }

        setOwedAmount(total);
      }
    }
  }, [
    selectedPerson,
    includeCurrentSemester,
    data,
    processedPeriods,
    currentPeriodIndex,
  ]);

  const handleSaveReminder = async () => {
    if (!email) {
      toast.error("Παρακαλώ εισάγετε το email σας");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Παρακαλώ εισάγετε ένα έγκυρο email");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Google Apps Script requires no-cors
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: selectedPerson,
          email: email,
        }),
      });

      // With no-cors, we can't read the response, so we assume success
      toast.success(`Η ειδοποίηση αποθηκεύτηκε το ${email}`);
      console.log(`Saved reminder for ${selectedPerson} at ${email}`);

      // Clear the form
      setWantsReminders(false);
      setEmail("");
    } catch (error) {
      console.error("Error saving reminder:", error);
      toast.error("Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.");
    } finally {
      setIsSaving(false);
    }
  };

  const getPaidUntilInfo = () => {
    if (!data || !selectedPerson) return "";
    const member = data.members.find((m) => m.name === selectedPerson);
    if (!member) return "";

    let lastPaidIndex = -1;
    for (let i = member.data.length - 1; i >= 0; i--) {
      if (member.data[i] === 1) {
        lastPaidIndex = i;
        break;
      }
    }

    if (lastPaidIndex < 0) {
      return "Καμία πληρωμή";
    }

    const paidUntilIndex = lastPaidIndex + 1;
    return processedPeriods[paidUntilIndex]?.label ?? "Πλήρως Εξοφλημένο";
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur rounded-xl p-8 shadow-xl max-w-2xl mx-auto">
        <h2 className="text-3xl mb-6 text-center">Υπολογιστής Οφειλών</h2>
        <div className="flex items-center justify-center h-40">
          <div className="text-gray-400">Φόρτωση δεδομένων...</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-800/50 backdrop-blur rounded-xl p-8 shadow-xl max-w-2xl mx-auto">
        <h2 className="text-3xl mb-6 text-center">Υπολογιστής Οφειλών</h2>
        <div className="flex items-center justify-center h-40">
          <div className="text-red-400">Σφάλμα φόρτωσης δεδομένων</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl p-8 shadow-xl max-w-2xl mx-auto">
      <h2 className="text-3xl mb-6 text-center">Υπολογιστής Οφειλών</h2>

      <div className="space-y-6">
        {/* Person Selection */}
        <div className="space-y-2">
          <Label htmlFor="person-select">Επιλέξτε το όνομά σας</Label>
          <Select value={selectedPerson} onValueChange={setSelectedPerson}>
            <SelectTrigger
              id="person-select"
              className="bg-gray-700 border-gray-600"
            >
              <SelectValue placeholder="Επιλέξτε άτομο..." />
            </SelectTrigger>
            <SelectContent>
              {data.members.map((member) => (
                <SelectItem key={member.name} value={member.name}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPerson && (
          <>
            {/* Current Status */}
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <p className="text-sm text-gray-300">
                Έχετε πληρώσει μέχρι:{" "}
                <span className="text-green-400 font-semibold">
                  {getPaidUntilInfo()}
                </span>
              </p>
            </div>

            {/* Include Current Semester Toggle */}
            <div className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="current-semester">
                  Να συμπεριληφθεί και το τρέχον εξάμηνο;
                </Label>
                <p className="text-sm text-gray-400">
                  {currentPeriod?.label || "N/A"} -{" "}
                  {nextPeriod?.label || "N/A"} (τρέχον)
                </p>
              </div>
              <Switch
                id="current-semester"
                checked={includeCurrentSemester}
                onCheckedChange={setIncludeCurrentSemester}
              />
            </div>

            {/* Amount Owed Display */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-lg text-center">
              <p className="text-sm text-purple-100 mb-2">Ποσό προς πληρωμή</p>
              <p className="text-5xl mb-2">{owedAmount}€</p>
              <p className="text-sm text-purple-100">
                {owedAmount === 0
                  ? "🎉 Είστε ενημερωμένοι!"
                  : includeCurrentSemester
                  ? "έως και το τρέχον εξάμηνο"
                  : "έως το τρέχον εξάμηνο"}
              </p>
            </div>

            {/* Reminder Checkbox */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="reminders"
                  checked={wantsReminders}
                  onCheckedChange={(checked) =>
                    setWantsReminders(checked as boolean)
                  }
                />
                <Label htmlFor="reminders" className="cursor-pointer">
                  Θέλω να ενημερώνομαι κάθε εξάμηνο αν χρωστάω.
                </Label>
              </div>

              {wantsReminders && (
                <div className="space-y-3 pl-7 animate-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email για ειδοποιήσεις</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="to-email-sou@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-700 border-gray-600"
                      disabled={isSaving}
                    />
                  </div>
                  <Button
                    onClick={handleSaveReminder}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isSaving}
                  >
                    {isSaving ? "Αποθήκευση..." : "Αποθήκευση"}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
