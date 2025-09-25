import { zodResolver } from '@hookform/resolvers/zod';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import WarningIcon from '@mui/icons-material/Warning';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from '@mui/material';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAssessment } from '../../api/hooks/useAssessment';
import { useCreateAssessment, useRisk, useUpdateAssessment } from '../../api/hooks/useRisks';
import { ApiError } from '../../api/httpClient';

const evaluationSchema = z.object({
  method: z.string().min(2, 'Méthode requise'),
  score: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
  attachments: z.array(z.string().url('URL invalide')).optional()
});

type EvaluationForm = z.infer<typeof evaluationSchema>;

const steps = ['Méthode', 'Notes', 'Pièces jointes'];

export function RiskEvaluationRoute() {
  const { riskId } = useParams({ from: '/risks/$riskId/evaluation' });
  const navigate = useNavigate({ from: '/risks/$riskId/evaluation' });
  const search = useSearch({ from: '/risks/$riskId/evaluation' }) as { assessmentId?: number };
  const numericRiskId = Number(riskId);

  const form = useForm<EvaluationForm>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: { method: '', score: 0, notes: '', attachments: [] }
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const lastUpdatedAtRef = useRef<string | null>(null);

  const { data: risk, isLoading: isRiskLoading, error: riskError } = useRisk(numericRiskId);
  const { data: assessment, isLoading: isAssessmentLoading } = useAssessment(
    numericRiskId,
    search.assessmentId ?? null,
    { enabled: Boolean(search.assessmentId) }
  );

  const createAssessment = useCreateAssessment();
  const updateAssessment = useUpdateAssessment();

  useEffect(() => {
    if (assessment) {
      form.reset({
        method: assessment.method,
        score: assessment.score,
        notes: assessment.notes ?? '',
        attachments: assessment.attachments?.map((file) => file.url) ?? []
      });
      lastUpdatedAtRef.current = assessment.updatedAt ?? null;
    }
  }, [assessment, form]);

  const [pendingValues, setPendingValues] = useState<EvaluationForm | null>(null);
  const debouncedValuesRef = useRef<EvaluationForm | null>(null);

  useEffect(() => {
    if (!search.assessmentId) return;
    const subscription = form.watch((value) => {
      setPendingValues(value as EvaluationForm);
    });
    return () => subscription.unsubscribe();
  }, [form, search.assessmentId]);

  useEffect(() => {
    debouncedValuesRef.current = pendingValues;
    if (!search.assessmentId || !form.formState.isDirty || !pendingValues) return;

    const timeout = setTimeout(async () => {
      try {
        const updated = await updateAssessment.mutateAsync({
          assessmentId: search.assessmentId!,
          riskId: numericRiskId,
          payload: {
            method: debouncedValuesRef.current?.method ?? '',
            score: debouncedValuesRef.current?.score ?? 0,
            notes: debouncedValuesRef.current?.notes,
            attachments:
              debouncedValuesRef.current?.attachments?.map((url) => ({ name: url, url })) ?? [],
            updatedAt: lastUpdatedAtRef.current ?? undefined
          }
        });
        setConflictError(null);
        setLastSavedAt(new Date());
        if (updated?.updatedAt) {
          lastUpdatedAtRef.current = updated.updatedAt;
        }
        form.reset(form.getValues(), { keepDirty: false });
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) {
          setConflictError(
            err.problem?.detail ?? 'Conflit détecté. Rechargez la page pour récupérer la dernière version.'
          );
        }
      }
    }, 1200);

    return () => clearTimeout(timeout);
  }, [form, numericRiskId, pendingValues, search.assessmentId, updateAssessment]);

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const isLoading = isRiskLoading || isAssessmentLoading;

  const onSubmit = form.handleSubmit(async (values) => {
    if (!search.assessmentId) {
      const result = await createAssessment.mutateAsync({
        riskId: numericRiskId,
        method: values.method,
        score: values.score,
        notes: values.notes,
        attachments: values.attachments?.map((url) => ({ name: url, url })) ?? []
      });
      setLastSavedAt(new Date());
      lastUpdatedAtRef.current = result.updatedAt ?? null;
      navigate({
        to: '/risks/$riskId/evaluation',
        params: { riskId: numericRiskId },
        search: { assessmentId: result.id }
      });
    } else {
      const updated = await updateAssessment.mutateAsync({
        assessmentId: search.assessmentId,
        riskId: numericRiskId,
        payload: {
          method: values.method,
          score: values.score,
          notes: values.notes,
          attachments: values.attachments?.map((url) => ({ name: url, url })) ?? [],
          updatedAt: lastUpdatedAtRef.current ?? undefined
        }
      });
      setLastSavedAt(new Date());
      if (updated?.updatedAt) {
        lastUpdatedAtRef.current = updated.updatedAt;
      }
    }
  });

  if (isLoading) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!risk) {
    return (
      <Alert severity="error">{riskError?.problem?.detail ?? 'Risque introuvable'}</Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Button variant="text" onClick={() => navigate({ to: '/risks/$riskId', params: { riskId: numericRiskId } })}>
          Retour au détail
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Évaluation du risque: {risk.label}
        </Typography>
      </Stack>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Divider sx={{ my: 3 }} />
        <form onSubmit={onSubmit}>
          <Stack spacing={3}>
            {currentStep === 0 && (
              <Stack spacing={2}>
                <TextField
                  label="Méthode"
                  {...form.register('method')}
                  error={Boolean(form.formState.errors.method)}
                  helperText={form.formState.errors.method?.message}
                  required
                />
                <TextField
                  label="Score"
                  type="number"
                  inputProps={{ min: 0, max: 100 }}
                  {...form.register('score', { valueAsNumber: true })}
                  error={Boolean(form.formState.errors.score)}
                  helperText={form.formState.errors.score?.message}
                  required
                />
              </Stack>
            )}

            {currentStep === 1 && (
              <TextField
                label="Notes"
                {...form.register('notes')}
                multiline
                minRows={4}
                placeholder="Décrivez les observations, les mesures existantes…"
              />
            )}

            {currentStep === 2 && (
              <Stack spacing={1}>
                <Typography variant="subtitle1">Liens des pièces jointes</Typography>
                <TextField
                  multiline
                  minRows={4}
                  placeholder="https://exemple.com/document.pdf"
                  value={(form.getValues('attachments') ?? []).join('\n')}
                  onChange={(event) =>
                    form.setValue(
                      'attachments',
                      event.target.value
                        .split('\n')
                        .map((value) => value.trim())
                        .filter(Boolean),
                      { shouldDirty: true }
                    )
                  }
                />
                {form.formState.errors.attachments && (
                  <Alert severity="warning">
                    {form.formState.errors.attachments.message as string}
                  </Alert>
                )}
              </Stack>
            )}

            {conflictError && (
              <Alert severity="warning" icon={<WarningIcon />}>
                {conflictError}
              </Alert>
            )}

            {lastSavedAt && (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                Dernière sauvegarde: {lastSavedAt.toLocaleTimeString()}
              </Alert>
            )}

            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button onClick={handleBack} disabled={currentStep === 0}>
                Précédent
              </Button>
              <Stack direction="row" spacing={2}>
                {currentStep < steps.length - 1 && (
                  <Button variant="contained" onClick={handleNext}>
                    Suivant
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                  <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
                    {search.assessmentId ? 'Sauvegarder' : 'Créer'}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
