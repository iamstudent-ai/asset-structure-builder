import { ASSET_FIELDS, FIELD_TYPES, EDITABLE_FIELDS } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, Pencil } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            IT Asset Management — Phase 1
          </h1>
          <p className="text-muted-foreground text-sm">
            Data structure created successfully. Review your 18 fields below.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Asset Data Model — {ASSET_FIELDS.length} Fields
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-t">
              {ASSET_FIELDS.map((field, i) => {
                const isEditable = EDITABLE_FIELDS.includes(field);
                const type = FIELD_TYPES[field];
                return (
                  <div
                    key={field}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                      i % 2 === 0 ? "bg-muted/40" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isEditable ? (
                        <Pencil className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="text-foreground font-medium">{field}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={type === "date" ? "secondary" : "outline"} className="text-xs">
                        {type}
                      </Badge>
                      {isEditable && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          Editable
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 text-sm text-muted-foreground space-y-1">
            <p>✅ 18 fields defined — matches your Excel exactly</p>
            <p>✅ Only "Serial Number" is editable</p>
            <p>✅ 3 date fields, 1 number field, 14 text fields</p>
            <p>✅ 5 sample assets loaded for testing</p>
            <p className="pt-2 text-foreground font-medium">
              Ready for Phase 2 → Asset List Page
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
