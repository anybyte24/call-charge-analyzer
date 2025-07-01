
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Check, X, Eye } from 'lucide-react';
import { PrefixConfig } from '@/types/call-analysis';
import { toast } from '@/hooks/use-toast';

interface UnknownNumbersManagerProps {
  unknownNumbers: string[];
  prefixConfig: PrefixConfig[];
  onPrefixConfigChange: (config: PrefixConfig[]) => void;
  onUnknownNumbersChange: (numbers: string[]) => void;
}

const UnknownNumbersManager: React.FC<UnknownNumbersManagerProps> = ({ 
  unknownNumbers, 
  prefixConfig, 
  onPrefixConfigChange,
  onUnknownNumbersChange 
}) => {
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCostPerMinute, setNewCostPerMinute] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'mobile' | 'landline' | 'special' | 'unknown'>('mobile');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const extractPrefix = (number: string): string => {
    // Remove +39, spaces, # and other characters
    const cleanNumber = number.replace(/^(\+39|0039|39)/, '').replace(/[^0-9]/g, '');
    
    // Try different prefix lengths
    if (cleanNumber.startsWith('3')) return '3'; // Mobile
    if (cleanNumber.startsWith('7')) return '7'; // Mobile
    if (cleanNumber.startsWith('0')) {
      // For landline, try different lengths
      if (cleanNumber.length >= 4) return cleanNumber.substring(0, 4);
      if (cleanNumber.length >= 3) return cleanNumber.substring(0, 3);
      return cleanNumber.substring(0, 2);
    }
    
    // For special numbers, try first 3 digits
    if (cleanNumber.length >= 3) return cleanNumber.substring(0, 3);
    return cleanNumber;
  };

  const handleNumberSelection = (number: string, selected: boolean) => {
    if (selected) {
      setSelectedNumbers([...selectedNumbers, number]);
    } else {
      setSelectedNumbers(selectedNumbers.filter(n => n !== number));
    }
  };

  const handleAssignToExistingCategory = (category: 'mobile' | 'landline' | 'special' | 'unknown') => {
    if (selectedNumbers.length === 0) {
      toast({
        title: "Nessun numero selezionato",
        description: "Seleziona almeno un numero da categorizzare",
        variant: "destructive"
      });
      return;
    }

    const existingConfig = prefixConfig.find(c => c.category === category);
    if (!existingConfig) {
      toast({
        title: "Categoria non trovata",
        description: "La categoria selezionata non esiste",
        variant: "destructive"
      });
      return;
    }

    // Create new prefix configs for selected numbers
    const newPrefixConfigs: PrefixConfig[] = [];
    
    selectedNumbers.forEach(number => {
      const prefix = extractPrefix(number);
      
      // Check if prefix already exists
      if (!prefixConfig.some(c => c.prefix === prefix)) {
        newPrefixConfigs.push({
          prefix,
          category: existingConfig.category,
          description: existingConfig.description,
          costPerMinute: existingConfig.costPerMinute
        });
      }
    });

    if (newPrefixConfigs.length > 0) {
      onPrefixConfigChange([...prefixConfig, ...newPrefixConfigs]);
      
      // Remove assigned numbers from unknown list
      const remainingNumbers = unknownNumbers.filter(n => !selectedNumbers.includes(n));
      onUnknownNumbersChange(remainingNumbers);
      
      setSelectedNumbers([]);
      
      toast({
        title: "Numeri categorizzati",
        description: `${newPrefixConfigs.length} prefissi aggiunti alla categoria ${existingConfig.description}`,
      });
    }
  };

  const handleCreateNewCategory = () => {
    if (!newCategory || !newDescription || !newCostPerMinute) {
      toast({
        title: "Campi mancanti",
        description: "Compila tutti i campi per creare una nuova categoria",
        variant: "destructive"
      });
      return;
    }

    if (selectedNumbers.length === 0) {
      toast({
        title: "Nessun numero selezionato",
        description: "Seleziona almeno un numero per la nuova categoria",
        variant: "destructive"
      });
      return;
    }

    // Create new prefix configs
    const newPrefixConfigs: PrefixConfig[] = [];
    
    selectedNumbers.forEach(number => {
      const prefix = extractPrefix(number);
      
      if (!prefixConfig.some(c => c.prefix === prefix)) {
        newPrefixConfigs.push({
          prefix,
          category: selectedCategory,
          description: newDescription,
          costPerMinute: parseFloat(newCostPerMinute)
        });
      }
    });

    if (newPrefixConfigs.length > 0) {
      onPrefixConfigChange([...prefixConfig, ...newPrefixConfigs]);
      
      // Remove assigned numbers from unknown list
      const remainingNumbers = unknownNumbers.filter(n => !selectedNumbers.includes(n));
      onUnknownNumbersChange(remainingNumbers);
      
      setSelectedNumbers([]);
      setNewCategory('');
      setNewDescription('');
      setNewCostPerMinute('');
      setShowCreateForm(false);
      
      toast({
        title: "Nuova categoria creata",
        description: `${newPrefixConfigs.length} prefissi aggiunti alla categoria "${newDescription}"`,
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mobile': return 'bg-blue-100 text-blue-800';
      case 'landline': return 'bg-green-100 text-green-800';
      case 'special': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueCategories = Array.from(new Set(prefixConfig.map(c => c.category)));

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle>Numeri Non Riconosciuti</CardTitle>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              {unknownNumbers.length} numeri
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Questi numeri non sono stati riconosciuti dal sistema di categorizzazione. Assegnali a una categoria esistente o creane una nuova.
          </p>
        </CardHeader>
        <CardContent>
          {unknownNumbers.length === 0 ? (
            <div className="text-center py-8">
              <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ottimo lavoro!
              </h3>
              <p className="text-gray-500">
                Tutti i numeri sono stati categorizzati correttamente
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedNumbers(unknownNumbers)}
                >
                  Seleziona tutti
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedNumbers([])}
                >
                  Deseleziona tutti
                </Button>
                <Badge variant="secondary">
                  {selectedNumbers.length} selezionati
                </Badge>
              </div>

              <div className="max-h-60 overflow-y-auto mb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Sel.</TableHead>
                      <TableHead>Numero</TableHead>
                      <TableHead>Prefisso Estratto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unknownNumbers.map((number, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedNumbers.includes(number)}
                            onChange={(e) => handleNumberSelection(number, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{number}</TableCell>
                        <TableCell className="font-mono text-sm font-bold text-blue-600">
                          {extractPrefix(number)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Assegna a categoria esistente:</h4>
                  <div className="flex flex-wrap gap-2">
                    {uniqueCategories.map(category => {
                      const config = prefixConfig.find(c => c.category === category);
                      return config ? (
                        <Button
                          key={category}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignToExistingCategory(category as any)}
                          disabled={selectedNumbers.length === 0}
                          className="flex items-center space-x-2"
                        >
                          <span className={`w-3 h-3 rounded-full ${getCategoryColor(category).replace('text-', 'bg-').split(' ')[0]}`}></span>
                          <span>{config.description}</span>
                          <span className="text-gray-500">€{config.costPerMinute.toFixed(2)}/min</span>
                        </Button>
                      ) : null;
                    })}
                  </div>
                </div>

                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Crea nuova categoria</span>
                  </Button>
                </div>

                {showCreateForm && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-sm font-medium">Tipo</label>
                        <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mobile">Mobile</SelectItem>
                            <SelectItem value="landline">Fisso</SelectItem>
                            <SelectItem value="special">Speciale</SelectItem>
                            <SelectItem value="unknown">Altro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Descrizione</label>
                        <Input
                          placeholder="es. Numero Verde"
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Costo/min (€)</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newCostPerMinute}
                          onChange={(e) => setNewCostPerMinute(e.target.value)}
                        />
                      </div>
                      <div className="flex items-end space-x-2">
                        <Button
                          size="sm"
                          onClick={handleCreateNewCategory}
                          disabled={selectedNumbers.length === 0}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Crea
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowCreateForm(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnknownNumbersManager;
