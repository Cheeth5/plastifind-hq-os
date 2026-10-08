import { useState, useTransition } from "react";
import {
  Building2,
  Calendar,
  GraduationCap,
  Award,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  User,
  Shield,
  FileText,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { uploadFile } from "@/lib/db";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useProfileExt,
  useUpdateProfileExt,
  type ProfileData,
  type Experience,
  type Education,
  type Certification,
  type ProjectShowcase,
} from "@/lib/profile-ext";
import type { Row } from "@/lib/db";

const DEFAULT_BANNER_TEMPLATES = [
  "linear-gradient(135deg, #091a28 0%, #0d283f 50%, #064060 100%)",
  "linear-gradient(135deg, #07171e 0%, #0b343d 50%, #106b5b 100%)",
  "linear-gradient(135deg, #140d24 0%, #29124a 50%, #4c1d95 100%)",
  "linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)",
];

export function ProfileEditorModal({
  open,
  onOpenChange,
  userId,
  profile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  profile?: Row | null;
}) {
  const { data: ext } = useProfileExt(userId);
  const update = useUpdateProfileExt();
  const [form, setForm] = useState<ProfileData>(() => ext ?? {});
  const [activeTab, setActiveTab] = useState("basic");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [, startTransition] = useTransition();

  const handleSave = async () => {
    await update.mutateAsync({ userId, data: form });
    onOpenChange(false);
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const path = await uploadFile(file, "avatars");
      setForm((prev) => ({ ...prev, avatarUrl: path }));
      toast.success("Photo de profil téléversée");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error("Échec du téléversement", { description: message });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    setUploadingBanner(true);
    try {
      const path = await uploadFile(file, "banners");
      setForm((prev) => ({ ...prev, bannerUrl: path }));
      toast.success("Bannière téléversée");
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error("Échec du téléversement", { description: message });
    } finally {
      setUploadingBanner(false);
    }
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: "",
      role: "",
      startDate: "",
      current: true,
      description: "",
    };
    setForm((prev) => ({ ...prev, experiences: [...(prev.experiences ?? []), newExp] }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      school: "",
      degree: "",
      startDate: "",
      description: "",
    };
    setForm((prev) => ({ ...prev, education: [...(prev.education ?? []), newEdu] }));
  };

  const addCertification = () => {
    const newCert: Certification = {
      id: crypto.randomUUID(),
      name: "",
      issuer: "",
      issueDate: "",
    };
    setForm((prev) => ({ ...prev, certifications: [...(prev.certifications ?? []), newCert] }));
  };

  const addProject = () => {
    const newProj: ProjectShowcase = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      role: "",
    };
    setForm((prev) => ({ ...prev, projects: [...(prev.projects ?? []), newProj] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border/70 p-6 pb-4">
          <DialogTitle className="text-xl">Modifier mon profil professionnel</DialogTitle>
          <DialogDescription>
            Personnalisez votre identité au sein de l'équipe PlastiFind OS.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[calc(90vh-140px)] flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <div className="border-b border-border/60 px-6">
              <TabsList className="h-10 bg-transparent p-0">
                <TabsTrigger
                  value="basic"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Infos de base
                </TabsTrigger>
                <TabsTrigger
                  value="experience"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Expérience
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Formation
                </TabsTrigger>
                <TabsTrigger
                  value="certifications"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Certifications
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Compétences
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Projets
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="basic" className="m-0 space-y-5">
                {/* Profile Picture Upload Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center rounded-xl border border-border/70 bg-card p-4">
                  <div className="relative">
                    {form.avatarUrl || profile?.["avatar_url"] ? (
                      <img
                        src={form.avatarUrl || profile?.["avatar_url"]}
                        alt="Photo de profil"
                        className="h-20 w-20 rounded-full border-2 border-primary object-cover shadow-md"
                      />
                    ) : (
                      <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-dashed border-border bg-surface text-xl font-bold text-muted-foreground">
                        <User className="h-8 w-8 text-muted-foreground/60" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <Label className="text-sm font-semibold">Photo de profil</Label>
                    <p className="text-xs text-muted-foreground">
                      Formats supportés : JPG, PNG ou WEBP (recommandé : 400x400).
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={uploadingAvatar}
                        className="relative cursor-pointer overflow-hidden"
                      >
                        <Upload className="mr-1.5 h-3.5 w-3.5" />
                        {uploadingAvatar ? "Téléversement..." : "Changer la photo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 cursor-pointer opacity-0"
                          disabled={uploadingAvatar}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleAvatarUpload(f);
                          }}
                        />
                      </Button>
                      {form.avatarUrl && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setForm((p) => ({ ...p, avatarUrl: "" }))}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Supprimer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Banner Custom Image Upload Section */}
                <div className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">
                        Image de Bannière Personnalisée
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Téléversez votre propre image de couverture pour votre profil.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={uploadingBanner}
                      className="relative cursor-pointer overflow-hidden"
                    >
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                      {uploadingBanner ? "Téléversement..." : "Importer une image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        disabled={uploadingBanner}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleBannerUpload(f);
                        }}
                      />
                    </Button>
                  </div>

                  {form.bannerUrl && !form.bannerUrl.startsWith("linear-gradient") && (
                    <div className="relative h-24 w-full overflow-hidden rounded-lg border border-border">
                      <img
                        src={form.bannerUrl}
                        alt="Bannière personnalisée"
                        className="h-full w-full object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute right-2 top-2 h-7 w-7"
                        onClick={() => setForm((p) => ({ ...p, bannerUrl: "" }))}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <Label className="text-xs text-muted-foreground">
                      Ou choisissez un thème prédéfini :
                    </Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {DEFAULT_BANNER_TEMPLATES.map((bg, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, bannerUrl: bg }))}
                          style={{ background: bg }}
                          className={cn(
                            "h-12 rounded-lg border transition-all hover:scale-105",
                            form.bannerUrl === bg
                              ? "border-primary ring-2 ring-primary/40"
                              : "border-border",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Titre / Headline professionnel</Label>
                  <Input
                    placeholder="Ex: Ingénieur IA & Robotique | Vision par ordinateur"
                    value={form.headline ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Biographie / À propos</Label>
                  <Textarea
                    rows={4}
                    placeholder="Présentez votre parcours, vos spécialités et vos centres d'intérêt dans la robotique..."
                    value={form.bio ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Département / Pôle</Label>
                    <Input
                      placeholder="Ex: R&D / Systèmes Embarqués"
                      value={form.department ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Localisation</Label>
                    <Input
                      placeholder="Ex: Brest, France"
                      value={form.location ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="m-0 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Ajoutez vos expériences professionnelles passées ou actuelles.
                  </p>
                  <Button size="sm" variant="outline" onClick={addExperience}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Ajouter
                  </Button>
                </div>

                {(form.experiences ?? []).map((exp, i) => (
                  <div
                    key={exp.id || i}
                    className="relative rounded-xl border border-border/70 bg-card p-4 space-y-3"
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-2 top-2 h-7 w-7 text-destructive"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          experiences: p.experiences?.filter((_, idx) => idx !== i),
                        }))
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        placeholder="Entreprise"
                        value={exp.company}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((p) => ({
                            ...p,
                            experiences: p.experiences?.map((x, idx) =>
                              idx === i ? { ...x, company: val } : x,
                            ),
                          }));
                        }}
                      />
                      <Input
                        placeholder="Poste / Rôle"
                        value={exp.role}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((p) => ({
                            ...p,
                            experiences: p.experiences?.map((x, idx) =>
                              idx === i ? { ...x, role: val } : x,
                            ),
                          }));
                        }}
                      />
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="Description des réalisations..."
                      value={exp.description ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((p) => ({
                          ...p,
                          experiences: p.experiences?.map((x, idx) =>
                            idx === i ? { ...x, description: val } : x,
                          ),
                        }));
                      }}
                    />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="education" className="m-0 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Ajoutez votre formation académique et vos diplômes.
                  </p>
                  <Button size="sm" variant="outline" onClick={addEducation}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Ajouter
                  </Button>
                </div>

                {(form.education ?? []).map((edu, i) => (
                  <div
                    key={edu.id || i}
                    className="relative rounded-xl border border-border/70 bg-card p-4 space-y-3"
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-2 top-2 h-7 w-7 text-destructive"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          education: p.education?.filter((_, idx) => idx !== i),
                        }))
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        placeholder="École / Université"
                        value={edu.school}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((p) => ({
                            ...p,
                            education: p.education?.map((x, idx) =>
                              idx === i ? { ...x, school: val } : x,
                            ),
                          }));
                        }}
                      />
                      <Input
                        placeholder="Diplôme / Formation"
                        value={edu.degree}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((p) => ({
                            ...p,
                            education: p.education?.map((x, idx) =>
                              idx === i ? { ...x, degree: val } : x,
                            ),
                          }));
                        }}
                      />
                      <Input
                        placeholder="Année de début"
                        value={edu.startDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((p) => ({
                            ...p,
                            education: p.education?.map((x, idx) =>
                              idx === i ? { ...x, startDate: val } : x,
                            ),
                          }));
                        }}
                      />
                      <Input
                        placeholder="Année de fin"
                        value={edu.endDate ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((p) => ({
                            ...p,
                            education: p.education?.map((x, idx) =>
                              idx === i ? { ...x, endDate: val } : x,
                            ),
                          }));
                        }}
                      />
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="Description (spécialité, mentions, cours pertinents...)"
                      value={edu.description ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((p) => ({
                          ...p,
                          education: p.education?.map((x, idx) =>
                            idx === i ? { ...x, description: val } : x,
                          ),
                        }));
                      }}
                    />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="certifications" className="m-0 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Ajoutez vos certifications et licences professionnelles.
                  </p>
                  <Button size="sm" variant="outline" onClick={addCertification}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Ajouter
                  </Button>
                </div>

                {(form.certifications ?? []).map((cert, i) => (
                  <div
                    key={cert.id || i}
                    className="relative rounded-xl border border-border/70 bg-card p-4 space-y-3"
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-2 top-2 h-7 w-7 text-destructive"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          certifications: p.certifications?.filter((_, idx) => idx !== i),
                        }))
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        placeholder="Nom de la certification"
                        value={cert.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((p) => ({
                            ...p,
                            certifications: p.certifications?.map((x, idx) =>
                              idx === i ? { ...x, name: val } : x,
                            ),
                          }));
                        }}
                      />
                      <Input
                        placeholder="Organisme émetteur"
                        value={cert.issuer}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((p) => ({
                            ...p,
                            certifications: p.certifications?.map((x, idx) =>
                              idx === i ? { ...x, issuer: val } : x,
                            ),
                          }));
                        }}
                      />
                      <Input
                        placeholder="Date d'obtention"
                        value={cert.issueDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((p) => ({
                            ...p,
                            certifications: p.certifications?.map((x, idx) =>
                              idx === i ? { ...x, issueDate: val } : x,
                            ),
                          }));
                        }}
                      />
                      <Input
                        placeholder="URL du certificat (optionnel)"
                        value={cert.url ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((p) => ({
                            ...p,
                            certifications: p.certifications?.map((x, idx) =>
                              idx === i ? { ...x, url: val } : x,
                            ),
                          }));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="projects" className="m-0 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Mettez en avant vos projets personnels ou professionnels.
                  </p>
                  <Button size="sm" variant="outline" onClick={addProject}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Ajouter
                  </Button>
                </div>

                {(form.projects ?? []).map((proj, i) => (
                  <div
                    key={proj.id || i}
                    className="relative rounded-xl border border-border/70 bg-card p-4 space-y-3"
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-2 top-2 h-7 w-7 text-destructive"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          projects: p.projects?.filter((_, idx) => idx !== i),
                        }))
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        placeholder="Nom du projet"
                        value={proj.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((p) => ({
                            ...p,
                            projects: p.projects?.map((x, idx) =>
                              idx === i ? { ...x, name: val } : x,
                            ),
                          }));
                        }}
                      />
                      <Input
                        placeholder="Votre rôle"
                        value={proj.role ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((p) => ({
                            ...p,
                            projects: p.projects?.map((x, idx) =>
                              idx === i ? { ...x, role: val } : x,
                            ),
                          }));
                        }}
                      />
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="Description du projet..."
                      value={proj.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((p) => ({
                          ...p,
                          projects: p.projects?.map((x, idx) =>
                            idx === i ? { ...x, description: val } : x,
                          ),
                        }));
                      }}
                    />
                    <Input
                      placeholder="Lien (GitHub, démo...) (optionnel)"
                      value={proj.link ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((p) => ({
                          ...p,
                          projects: p.projects?.map((x, idx) =>
                            idx === i ? { ...x, link: val } : x,
                          ),
                        }));
                      }}
                    />
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="skills" className="m-0 space-y-4">
                <Label>Compétences clés (séparées par une virgule)</Label>
                <Input
                  placeholder="Ex: ROS2, Python, C++, IA & Vision, CAD, STM32"
                  value={(form.skills ?? []).join(", ")}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      skills: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }))
                  }
                />
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex justify-end gap-2 border-t border-border/70 bg-card px-6 py-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={update.isPending}>
              {update.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
