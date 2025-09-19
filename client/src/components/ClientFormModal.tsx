import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ClientFormData {
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  endereco: string;
}

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
  initialData?: Partial<ClientFormData>;
  isEditing?: boolean;
  isLoading?: boolean;
}

export function ClientFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  isLoading = false,
}: ClientFormModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ClientFormData>({
    nome: "",
    email: "",
    telefone: "",
    cpfCnpj: "",
    endereco: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    } else {
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        cpfCnpj: "",
        endereco: "",
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do cliente é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
      toast({
        title: isEditing ? "Cliente atualizado" : "Cliente criado",
        description: isEditing 
          ? "Os dados do cliente foram atualizados com sucesso." 
          : "O novo cliente foi cadastrado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o cliente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const updateFormData = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" data-testid="client-form-modal">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => updateFormData("nome", e.target.value)}
              placeholder="Ex: João Silva"
              data-testid="input-nome"
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateFormData("email", e.target.value)}
              placeholder="Ex: joao@email.com"
              data-testid="input-email"
            />
          </div>

          {/* Telefone */}
          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => updateFormData("telefone", e.target.value)}
              placeholder="Ex: (11) 99999-9999"
              data-testid="input-telefone"
            />
          </div>

          {/* CPF/CNPJ */}
          <div>
            <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
            <Input
              id="cpfCnpj"
              value={formData.cpfCnpj}
              onChange={(e) => updateFormData("cpfCnpj", e.target.value)}
              placeholder="Ex: 123.456.789-00"
              data-testid="input-cpf-cnpj"
            />
          </div>

          {/* Endereço */}
          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea
              id="endereco"
              value={formData.endereco}
              onChange={(e) => updateFormData("endereco", e.target.value)}
              placeholder="Ex: Rua das Flores, 123 - Centro - São Paulo/SP"
              className="min-h-20"
              data-testid="textarea-endereco"
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              data-testid="button-save"
            >
              {isLoading ? "Salvando..." : (isEditing ? "Atualizar" : "Criar Cliente")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}