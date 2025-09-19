import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientsFilterBar } from "@/components/ClientsFilterBar";
import { ClientsListTable } from "@/components/ClientsListTable";
import { ClientFormModal } from "@/components/ClientFormModal";
import { CasesListTable } from "@/components/CasesListTable";
import { CaseFormModal } from "@/components/CaseFormModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ClientData {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpfCnpj: string | null;
  endereco: string | null;
  createdAt: string;
}

interface CaseData {
  id: string;
  clienteId: string;
  numeroProcesso: string | null;
  tipoCaso: string;
  status: "Ativo" | "Finalizado" | "Suspenso" | "Arquivado";
  assunto: string;
  valorCausa: string | null;
  tribunal: string | null;
  observacoes: string | null;
  dataInicio: string;
  dataFim: string | null;
  createdAt: string;
  updatedAt: string;
}

type ViewMode = "clients" | "cases";

export default function ClientesECasos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados principais
  const [viewMode, setViewMode] = useState<ViewMode>("clients");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string>("");
  
  // Estados dos modais
  const [isClientFormModalOpen, setIsClientFormModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  
  const [isCaseFormModalOpen, setIsCaseFormModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseData | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");

  // Queries
  const { data: clients = [], isLoading: isLoadingClients } = useQuery<ClientData[]>({
    queryKey: ['/api/clientes'],
  });

  const { data: cases = [], isLoading: isLoadingCases } = useQuery<CaseData[]>({
    queryKey: ['/api/clientes', selectedClientId, 'casos'],
    queryFn: async () => {
      if (!selectedClientId) return [];
      const response = await fetch(`/api/clientes/${selectedClientId}/casos`);
      if (!response.ok) throw new Error('Failed to fetch cases');
      return response.json();
    },
    enabled: !!selectedClientId && viewMode === "cases",
  });

  // Mutations para clientes
  const createClientMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create client');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clientes'] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update client');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clientes'] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete client');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clientes'] });
    },
  });

  // Mutations para casos
  const createCaseMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/casos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create case');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clientes', selectedClientId, 'casos'] });
    },
  });

  const updateCaseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/casos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update case');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clientes', selectedClientId, 'casos'] });
    },
  });

  const deleteCaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/casos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete case');
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clientes', selectedClientId, 'casos'] });
    },
  });

  // Filtros aplicados
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    
    return clients.filter((client) =>
      client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.cpfCnpj && client.cpfCnpj.includes(searchTerm))
    );
  }, [clients, searchTerm]);

  // Handlers para clientes
  const handleNewClient = () => {
    setEditingClient(null);
    setIsClientFormModalOpen(true);
  };

  const handleEditClient = (id: string) => {
    const client = clients.find((c) => c.id === id);
    if (client) {
      setEditingClient(client);
      setIsClientFormModalOpen(true);
    }
  };

  const handleViewClient = (id: string) => {
    console.log(`Visualizar cliente: ${id}`);
    toast({
      title: "Visualizar Cliente",
      description: "Funcionalidade de visualização será implementada.",
    });
  };

  const handleDeleteClient = (id: string) => {
    setClientToDelete(id);
  };

  const handleViewCases = (id: string) => {
    const client = clients.find((c) => c.id === id);
    if (client) {
      setSelectedClientId(id);
      setSelectedClientName(client.nome);
      setViewMode("cases");
    }
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    
    try {
      await deleteClientMutation.mutateAsync(clientToDelete);
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cliente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setClientToDelete(null);
    }
  };

  const handleClientFormSubmit = async (data: any) => {
    if (editingClient) {
      await updateClientMutation.mutateAsync({ id: editingClient.id, data });
    } else {
      await createClientMutation.mutateAsync(data);
    }
  };

  // Handlers para casos
  const handleNewCase = () => {
    setEditingCase(null);
    setIsCaseFormModalOpen(true);
  };

  const handleEditCase = (id: string) => {
    const caso = cases.find((c) => c.id === id);
    if (caso) {
      setEditingCase(caso);
      setIsCaseFormModalOpen(true);
    }
  };

  const handleViewCase = (id: string) => {
    console.log(`Visualizar caso: ${id}`);
    toast({
      title: "Visualizar Caso",
      description: "Funcionalidade de visualização será implementada.",
    });
  };

  const handleDeleteCase = (id: string) => {
    setCaseToDelete(id);
  };

  const confirmDeleteCase = async () => {
    if (!caseToDelete) return;
    
    try {
      await deleteCaseMutation.mutateAsync(caseToDelete);
      toast({
        title: "Caso excluído",
        description: "O caso foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o caso. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCaseToDelete(null);
    }
  };

  const handleCaseFormSubmit = async (data: any) => {
    if (editingCase) {
      await updateCaseMutation.mutateAsync({ id: editingCase.id, data });
    } else {
      await createCaseMutation.mutateAsync(data);
    }
  };

  const handleBackToClients = () => {
    setViewMode("clients");
    setSelectedClientId(null);
    setSelectedClientName("");
  };

  return (
    <div className="p-6 space-y-6" data-testid="clientes-casos-page">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {viewMode === "clients" ? "Clientes e Casos" : `Casos - ${selectedClientName}`}
        </h1>
        <p className="text-muted-foreground">
          {viewMode === "clients" 
            ? "Gerencie seus clientes e seus respectivos casos jurídicos."
            : "Gerencie os casos jurídicos do cliente selecionado."
          }
        </p>
      </div>

      {viewMode === "clients" ? (
        <>
          {/* Barra de filtros para clientes */}
          <ClientsFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onNewClient={handleNewClient}
          />

          {/* Lista de clientes */}
          <ClientsListTable
            clients={filteredClients.map(client => ({
              ...client,
              createdAt: new Date(client.createdAt)
            }))}
            isLoading={isLoadingClients}
            onView={handleViewClient}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
            onViewCases={handleViewCases}
          />
        </>
      ) : (
        <>
          {/* Lista de casos */}
          <CasesListTable
            cases={cases.map(caso => ({
              ...caso,
              dataInicio: new Date(caso.dataInicio),
              dataFim: caso.dataFim ? new Date(caso.dataFim) : null,
              createdAt: new Date(caso.createdAt),
              updatedAt: new Date(caso.updatedAt)
            }))}
            clientName={selectedClientName}
            isLoading={isLoadingCases}
            onView={handleViewCase}
            onEdit={handleEditCase}
            onDelete={handleDeleteCase}
            onNewCase={handleNewCase}
            onBack={handleBackToClients}
          />
        </>
      )}

      {/* Modal de formulário de cliente */}
      <ClientFormModal
        open={isClientFormModalOpen}
        onClose={() => setIsClientFormModalOpen(false)}
        onSubmit={handleClientFormSubmit}
        initialData={editingClient || undefined}
        isEditing={!!editingClient}
        isLoading={createClientMutation.isPending || updateClientMutation.isPending}
      />

      {/* Modal de formulário de caso */}
      {selectedClientId && (
        <CaseFormModal
          open={isCaseFormModalOpen}
          onClose={() => setIsCaseFormModalOpen(false)}
          onSubmit={handleCaseFormSubmit}
          clienteId={selectedClientId}
          clienteName={selectedClientName}
          initialData={editingCase || undefined}
          isEditing={!!editingCase}
          isLoading={createCaseMutation.isPending || updateCaseMutation.isPending}
        />
      )}

      {/* Dialog de confirmação de exclusão de cliente */}
      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent data-testid="delete-client-confirmation-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão do Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir este cliente? Esta ação também excluirá todos os casos associados e não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-client">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteClient}
              data-testid="button-confirm-delete-client"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmação de exclusão de caso */}
      <AlertDialog open={!!caseToDelete} onOpenChange={() => setCaseToDelete(null)}>
        <AlertDialogContent data-testid="delete-case-confirmation-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão do Caso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir este caso jurídico? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-case">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCase}
              data-testid="button-confirm-delete-case"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}