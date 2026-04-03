# Ajout de l'option "Nuitée" aux périodes de prix

## ✅ Modifications effectuées

### 1. **Modèle de données** - Property.ts
- ✅ Ajouté `'nuitée'` à l'enum pricingPeriod
- ✅ Ordre: `['heure', 'jour', 'nuitée', 'semaine', 'mois']`

### 2. **Interface d'administration** - properties/page.tsx
- ✅ Ajouté `<SelectItem value="nuitée">/ nuitée</SelectItem>` dans les 2 formulaires
- ✅ Présent dans le formulaire d'ajout et d'édition

### 3. **Génération de PDF** - InvoiceTemplate.tsx
- ✅ Ajouté logique de calcul pour les nuitées
- ✅ `Math.max(1, booking.days - 1)` nuitée(s) (jours - 1)

## 📊 Logique de calcul des nuitées

| Durée séjour | Nombre de nuitées | Exemple |
|---|---|---|
| 1 jour | 1 nuitée | Check-in → Check-out |
| 2 jours | 1 nuitée | 1 nuit passée |
| 3 jours | 2 nuitées | 2 nuits passées |
| 7 jours | 6 nuitées | 6 nuits passées |

## 🔧 Fichiers modifiés

1. `src/lib/models/Property.ts` - Enum du modèle
2. `src/app/(admin)/admin/properties/page.tsx` - Interface utilisateur (2 endroits)
3. `src/components/pdf/InvoiceTemplate.tsx` - Génération PDF

## ✅ Validation

- ✅ Build réussi sans erreurs TypeScript
- ✅ Toutes les fonctionnalités existantes préservées
- ✅ Nouvelle option disponible dans l'interface
- ✅ Calcul correct dans les factures PDF

## 🎯 Utilisation

L'administrateur peut maintenant sélectionner "nuitée" comme période de tarification lors de la création ou modification d'un bien immobilier. Cette option est particulièrement utile pour les locations touristiques où le prix est calculé par nuit passée.