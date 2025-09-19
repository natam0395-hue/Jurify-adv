import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertPecaJuridicaSchema, 
  insertClienteSchema,
  insertTemplateSchema,
  insertHistoricoSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware para JSON
  app.use("/api", (req, res, next) => {
    if (req.method !== "GET") {
      res.header("Content-Type", "application/json");
    }
    next();
  });

  // ===== ROTAS DE PEÇAS JURÍDICAS =====
  
  // GET /api/pecas - Listar todas as peças
  app.get("/api/pecas", async (req, res) => {
    try {
      const pecas = await storage.getAllPecasJuridicas();
      const clientes = await storage.getAllClientes();
      
      // Enriquecer com dados do cliente
      const pecasComCliente = pecas.map(peca => {
        const cliente = clientes.find(c => c.id === peca.clienteId);
        return {
          ...peca,
          clienteNome: cliente?.nome || 'Cliente não encontrado'
        };
      });
      
      res.json(pecasComCliente);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar peças jurídicas" });
    }
  });

  // GET /api/pecas/:id - Buscar peça específica
  app.get("/api/pecas/:id", async (req, res) => {
    try {
      const peca = await storage.getPecaJuridica(req.params.id);
      if (!peca) {
        return res.status(404).json({ error: "Peça não encontrada" });
      }
      res.json(peca);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar peça" });
    }
  });

  // POST /api/pecas - Criar nova peça
  app.post("/api/pecas", async (req, res) => {
    try {
      const validatedData = insertPecaJuridicaSchema.parse(req.body);
      const novaPeca = await storage.createPecaJuridica(validatedData);
      res.status(201).json(novaPeca);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Erro ao criar peça" });
    }
  });

  // PUT /api/pecas/:id - Atualizar peça
  app.put("/api/pecas/:id", async (req, res) => {
    try {
      const validatedData = insertPecaJuridicaSchema.partial().parse(req.body);
      const pecaAtualizada = await storage.updatePecaJuridica(req.params.id, validatedData);
      
      if (!pecaAtualizada) {
        return res.status(404).json({ error: "Peça não encontrada" });
      }
      
      res.json(pecaAtualizada);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Erro ao atualizar peça" });
    }
  });

  // DELETE /api/pecas/:id - Deletar peça
  app.delete("/api/pecas/:id", async (req, res) => {
    try {
      const deletada = await storage.deletePecaJuridica(req.params.id);
      if (!deletada) {
        return res.status(404).json({ error: "Peça não encontrada" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao deletar peça" });
    }
  });

  // ===== ROTAS DE CLIENTES =====
  
  // GET /api/clientes - Listar todos os clientes
  app.get("/api/clientes", async (req, res) => {
    try {
      const clientes = await storage.getAllClientes();
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar clientes" });
    }
  });

  // POST /api/clientes - Criar novo cliente
  app.post("/api/clientes", async (req, res) => {
    try {
      const validatedData = insertClienteSchema.parse(req.body);
      const novoCliente = await storage.createCliente(validatedData);
      res.status(201).json(novoCliente);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Erro ao criar cliente" });
    }
  });

  // ===== ROTAS DE TEMPLATES =====
  
  // GET /api/templates - Listar todos os templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar templates" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
