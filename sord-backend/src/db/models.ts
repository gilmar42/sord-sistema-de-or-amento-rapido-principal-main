import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Schema para Usuários (Authentication)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  companyName: {
    type: String,
    required: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'admin'
  },
  active: {
    type: Boolean,
    default: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  planStartDate: {
    type: Date,
    default: () => new Date()
  },
  planEndDate: {
    type: Date,
    default: () => new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000) // 30 dias
  }
}, {
  timestamps: true
});

// Hash password antes de salvar
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Método para comparar senha
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Schema para Pagamentos
const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    index: true
  },
  orderId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'refunded']
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String
  },
  installments: {
    type: Number,
    default: 1
  },
  payer: {
    email: String,
    identification: {
      type: String,
      number: String
    },
    name: String
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Schema para Orçamentos (Quotes)
const quoteSchema = new mongoose.Schema({
  quoteNumber: {
    type: String,
    required: true,
    index: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    index: true
  },
  clientName: {
    type: String,
    required: true
  },
  items: [{
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    name: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'approved', 'rejected', 'cancelled'],
    default: 'draft'
  },
  notes: String,
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Schema para Clientes
const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  cpf: {
    type: String,
    sparse: true
  },
  cnpj: {
    type: String,
    sparse: true
  },
  address: {
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String,
    zipCode: String
  },
  notes: String,
  active: {
    type: Boolean,
    default: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Schema para Materiais
const materialSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    required: true,
    index: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['un', 'kg', 'm', 'm2', 'm3', 'l', 'cx', 'pc']
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  salePrice: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  minStock: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Schema para Planos/Pacotes
const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['STANDARD']
  },
  displayName: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  features: {
    maxClients: Number,
    maxQuotes: Number,
    maxUsers: Number,
    apiAccess: Boolean,
    customBranding: Boolean,
    advancedReports: Boolean,
    webhooks: Boolean,
    supportPriority: {
      type: String,
      enum: ['basic', 'priority', 'vip']
    }
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Criar índices compostos
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, active: 1 });
paymentSchema.index({ tenantId: 1, orderId: 1 });
paymentSchema.index({ tenantId: 1, status: 1 });
quoteSchema.index({ tenantId: 1, clientId: 1, status: 1 });
quoteSchema.index({ tenantId: 1, createdAt: -1 });
materialSchema.index({ tenantId: 1, category: 1, active: 1 });
materialSchema.index({ tenantId: 1, code: 1 });
clientSchema.index({ tenantId: 1, active: 1 });

// Exportar modelos
export const User = mongoose.model('User', userSchema);
export const Payment = mongoose.model('Payment', paymentSchema);
export const Quote = mongoose.model('Quote', quoteSchema);
export const Client = mongoose.model('Client', clientSchema);
export const Material = mongoose.model('Material', materialSchema);
export const Plan = mongoose.model('Plan', planSchema);

export default {
  User,
  Payment,
  Quote,
  Client,
  Material,
  Plan
};
