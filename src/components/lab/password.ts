// Règles de robustesse partagées par PasswordStrength et les modèles d'inscription.
export const passwordCriteria = [
  { label: '12 caractères minimum', test: (value: string) => value.length >= 12 },
  {
    label: 'Une majuscule et une minuscule',
    test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  { label: 'Un chiffre', test: (value: string) => /\d/.test(value) },
  { label: 'Un symbole', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];

export function passwordScore(value: string) {
  return value ? passwordCriteria.filter(item => item.test(value)).length : 0;
}
