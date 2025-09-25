import { zodResolver } from '@hookform/resolvers/zod';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TimelineIcon from '@mui/icons-material/Timeline';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useActionPlans, useCreateActionPlan } from '../../api/hooks/useActionPlans';
import { useCreateDocument, useDocuments } from '../../api/hooks/useDocuments';
import { useDownloadRiskReport } from '../../api/hooks/useReports';
import { useRisk } from '../../api/hooks/useRisks';

const actionPlanSchema = z.object({
  title: z.string().min(3, 'Titre requis'),
  dueDate: z.string().optional(),
  owner: z.string().optional()
});

type ActionPlanForm = z.infer<typeof actionPlanSchema>;

const documentSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  url: z.string().url('URL invalide'),
  type: z.string().min(2, 'Type requis')
});

type DocumentForm = z.infer<typeof documentSchema>;

export function RiskDetailRoute() {
  const { riskId } = useParams({ from: '/risks/$riskId' });
  const numericRiskId = Number(riskId);
  const navigate = useNavigate({ from: '/risks/$riskId' });
  const listSearch = useSearch({ from: '/risks' });

  const { data: risk, isLoading, isError, error } = useRisk(numericRiskId);
  const { data: actionPlans } = useActionPlans(numericRiskId);
  const { data: documents } = useDocuments(numericRiskId);

  const { mutateAsync: downloadPdf, isPending: isDownloading } = useDownloadRiskReport();
  const createActionPlan = useCreateActionPlan();
  const createDocument = useCreateDocument();

  const [actionPlanOpen, setActionPlanOpen] = useState(false);
  const [documentOpen, setDocumentOpen] = useState(false);

  const actionPlanForm = useForm<ActionPlanForm>({
    resolver: zodResolver(actionPlanSchema),
    defaultValues: { title: '', dueDate: '', owner: '' }
  });
  const documentForm = useForm<DocumentForm>({
    resolver: zodResolver(documentSchema),
    defaultValues: { name: '', url: '', type: '' }
  });

  if (isLoading) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <Typography variant="body1">Chargement du risque…</Typography>
      </Box>
    );
  }

  if (isError || !risk) {
    return (
      <Alert severity="error">
        {error?.problem?.detail ?? 'Impossible de charger les détails du risque.'}
      </Alert>
    );
  }

  const handleBack = () => {
    navigate({ to: '/risks', search: listSearch ?? {} });
  };

  const handleDownload = async () => {
    const blob = await downloadPdf(risk.id);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `risk-${risk.id}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }}>
        <Stack spacing={1}>
          <Typography variant="h4">{risk.label}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={`Code ${risk.code}`} color="primary" />
            <Chip label={`Score ${risk.score}`} color={risk.score > 50 ? 'warning' : 'default'} />
            <Chip label={`Statut ${risk.status}`} />
          </Stack>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: { xs: 2, md: 0 } }}>
          <Button variant="outlined" onClick={handleBack}>
            Retour à la liste
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate({ to: '/risks/$riskId/evaluation', params: { riskId: risk.id } })}
          >
            Ouvrir l’évaluation
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownload}
            disabled={isDownloading}
          >
            Export PDF
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <PaperSection title="Plan d’action" actionLabel="Ajouter" onAction={() => setActionPlanOpen(true)}>
            <List dense>
              {actionPlans?.data?.map((plan) => (
                <ListItem key={plan.id} divider>
                  <ListItemIcon>
                    <TimelineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={plan.title}
                    secondary={`Échéance: ${plan.dueDate ?? 'N/A'} — Responsable: ${plan.owner ?? 'N/A'}`}
                  />
                </ListItem>
              ))}
              {(!actionPlans || actionPlans.data?.length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 3 }}>
                  Aucun plan d’action enregistré.
                </Typography>
              )}
            </List>
          </PaperSection>
        </Grid>
        <Grid item xs={12} md={6}>
          <PaperSection title="Documents" actionLabel="Ajouter" onAction={() => setDocumentOpen(true)}>
            <List dense>
              {documents?.data?.map((doc) => (
                <ListItem
                  key={doc.id}
                  divider
                  secondaryAction={
                    <Button
                      size="small"
                      component="a"
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ouvrir
                    </Button>
                  }
                >
                  <ListItemIcon>
                    <DescriptionIcon color="action" />
                  </ListItemIcon>
                  <ListItemText primary={doc.name} secondary={doc.type} />
                </ListItem>
              ))}
              {(!documents || documents.data?.length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 3 }}>
                  Aucun document pour ce risque.
                </Typography>
              )}
            </List>
          </PaperSection>
        </Grid>
      </Grid>

      <Dialog open={actionPlanOpen} onClose={() => setActionPlanOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter un plan d’action</DialogTitle>
        <form
          onSubmit={actionPlanForm.handleSubmit(async (values) => {
            await createActionPlan.mutateAsync({
              riskId: risk.id,
              title: values.title,
              dueDate: values.dueDate || undefined,
              owner: values.owner || undefined,
              status: 'planned'
            });
            setActionPlanOpen(false);
            actionPlanForm.reset();
          })}
        >
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Titre"
              {...actionPlanForm.register('title')}
              error={Boolean(actionPlanForm.formState.errors.title)}
              helperText={actionPlanForm.formState.errors.title?.message}
              required
            />
            <TextField label="Échéance" type="date" InputLabelProps={{ shrink: true }} {...actionPlanForm.register('dueDate')} />
            <TextField label="Responsable" {...actionPlanForm.register('owner')} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionPlanOpen(false)}>Annuler</Button>
            <Button type="submit" variant="contained" disabled={createActionPlan.isPending}>
              Enregistrer
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={documentOpen} onClose={() => setDocumentOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter un document</DialogTitle>
        <form
          onSubmit={documentForm.handleSubmit(async (values) => {
            await createDocument.mutateAsync({
              riskId: risk.id,
              name: values.name,
              url: values.url,
              type: values.type
            });
            setDocumentOpen(false);
            documentForm.reset();
          })}
        >
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nom"
              {...documentForm.register('name')}
              error={Boolean(documentForm.formState.errors.name)}
              helperText={documentForm.formState.errors.name?.message}
              required
            />
            <TextField
              label="URL"
              {...documentForm.register('url')}
              error={Boolean(documentForm.formState.errors.url)}
              helperText={documentForm.formState.errors.url?.message}
              required
            />
            <TextField
              label="Type"
              {...documentForm.register('type')}
              error={Boolean(documentForm.formState.errors.type)}
              helperText={documentForm.formState.errors.type?.message}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDocumentOpen(false)}>Annuler</Button>
            <Button type="submit" variant="contained" disabled={createDocument.isPending}>
              Enregistrer
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Stack>
  );
}

interface PaperSectionProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}

function PaperSection({ title, actionLabel, onAction, children }: PaperSectionProps) {
  return (
    <Box component={Paper} variant="outlined" sx={{ p: 2, minHeight: 280 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        {actionLabel && onAction && (
          <Button size="small" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Stack>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Box>
  );
}
