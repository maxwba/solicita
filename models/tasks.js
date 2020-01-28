const mongoose = require('mongoose');

const { Schema } = mongoose;

const TasksSchema = new Schema(
  {
    priority: {
      type: String,
      enum: [
        'Alta prioridade',
        'Média prioridade',
        'Pouca prioridade',
      ],
    },
    title: String,
    description: String,
    username: String,
    userId: String,
    types: {
      type: String,
      enum: [
        'Briefing',
        'Analise',
        'Desenvolvimento',
        'Aprovação',
        'Refação',
      ],
    },
    states: {
      type: String,
      enum: [
        'Backlog',
        'Fazendo',
        'Feito',
      ],
    },
  },
  {
    timestamps: true,
  },
);
const Tasks = mongoose.model('Task', TasksSchema);
module.exports = Tasks;

// Schema.Types.ObjectId
