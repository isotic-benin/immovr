"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => { });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        alert(data.error || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Impossible de contacter le serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">

      {/* Page Header */}
      <div className="bg-slate-950 pt-32 md:pt-40 pb-16 px-4 shadow-2xl mb-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,var(--color-primary)_0%,transparent_50%),radial-gradient(ellipse_at_bottom,var(--color-secondary)_0%,transparent_50%)] opacity-10"></div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-float-slow"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none animate-float"></div>

        <div className="container mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-xl tracking-tight">Contactez-<span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">nous</span></h1>
          <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-3xl mx-auto font-light">
            Une question sur une réservation ? Besoin d&apos;aide pour utiliser la visite virtuelle ? Notre équipe est à votre disposition.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="glass bg-white/70 p-8 rounded-3xl text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <MapPin size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-slate-800">Notre Agence</h3>
            <p className="text-slate-600 font-medium">
              {settings?.localisation || "123 Avenue de l'Immobilier, Abidjan, Côte d'Ivoire"}
            </p>
          </div>

          <div className="glass bg-white/70 p-8 rounded-3xl text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
              <Phone size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-slate-800">Téléphone</h3>
            <p className="text-slate-600 font-medium whitespace-pre-line leading-relaxed">
              {settings?.telephone || "+225 01 02 03 04 05\n+225 05 06 07 08 09"}
            </p>
          </div>

          <div className="glass bg-white/70 p-8 rounded-3xl text-center flex flex-col items-center hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
              <Mail size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-slate-800">Email</h3>
            <p className="text-slate-600 font-medium">
              {settings?.email || "contact@immovr.ci"}
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass bg-white/70 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none"></div>

          {submitted ? (
            <div className="text-center py-12 animate-fade-in-up relative z-10">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-green-100/50">
                <Send className="text-green-600" size={48} />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Message Envoyé !</h2>
              <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">Nous avons bien reçu votre message. Notre équipe vous répondra dans les plus brefs délais.</p>
              <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-2xl h-14 px-8 text-lg font-semibold border-slate-300 hover:bg-slate-50">
                Envoyer un autre message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-3">Envoyez-nous un message</h2>
                <p className="text-slate-500 font-medium text-lg">Remplissez le formulaire ci-dessous et nous vous recontacterons.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-slate-700 font-semibold text-base">Votre Nom</Label>
                  <Input id="name" value={formData.name} onChange={handleChange} placeholder="Ex: Jean Dupont" required className="bg-white/60 border-slate-200 focus-visible:ring-primary h-14 rounded-2xl text-lg shadow-inner" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-slate-700 font-semibold text-base">Votre Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="Ex: jean.dupont@email.com" required className="bg-white/60 border-slate-200 focus-visible:ring-primary h-14 rounded-2xl text-lg shadow-inner" />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="subject" className="text-slate-700 font-semibold text-base">Sujet</Label>
                <Input id="subject" value={formData.subject} onChange={handleChange} placeholder="Ex: Demande de renseignement pour un appartement" required className="bg-white/60 border-slate-200 focus-visible:ring-primary h-14 rounded-2xl text-lg shadow-inner" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="message" className="text-slate-700 font-semibold text-base">Message</Label>
                <Textarea id="message" value={formData.message} onChange={handleChange} placeholder="Détaillez votre demande ici..." rows={6} required className="bg-white/60 border-slate-200 focus-visible:ring-primary rounded-2xl text-lg resize-none shadow-inner p-4" />
              </div>
              <Button type="submit" size="lg" className="w-full rounded-2xl h-16 text-lg font-bold shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-secondary hover:scale-[1.02] transition-all border-0 text-white" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>Envoi en cours...</>
                ) : (
                  <><Send className="mr-2" size={20} /> Envoyer le message</>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
