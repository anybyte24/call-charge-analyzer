
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { PrefixConfig } from '@/types/call-analysis';
import { CallAnalyzer } from '@/utils/call-analyzer';

interface PrefixManagerProps {
  prefixConfig: PrefixConfig[];
  onConfigChange: (config: PrefixConfig[]) => void;
}

const PrefixManager: React.FC<PrefixManagerProps> = ({ prefixConfig, onConfigChange }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrefix, setNewPrefix] = useState<Partial<PrefixConfig>>({});
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newPrefix.prefix && newPrefix.category && newPrefix.description && newPrefix.costPerMinute !== undefined) {
      const updatedConfig = [...prefixConfig, newPrefix as PrefixConfig];
      onConfigChange(updatedConfig);
      setNewPrefix({});
      setIsAdding(false);
    }
  };

  const handleEdit = (prefix: PrefixConfig, field: keyof PrefixConfig, value: any) => {
    const updatedConfig = prefixConfig.map(p => 
      p.prefix === prefix.prefix ? { ...p, [field]: value } : p
    );
    onConfigChange(updatedConfig);
  };

  const handleDelete = (prefixToDelete: string) => {
    const updatedConfig = prefixConfig.filter(p => p.prefix !== prefixToDelete);
    onConfigChange(updatedConfig);
  };

  const resetToDefaults = () => {
    onConfigChange(CallAnalyzer.defaultPrefixConfig);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mobile': return 'bg-blue-100 text-blue-800';
      case 'landline': return 'bg-green-100 text-green-800';
      case 'special': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gestione Prefissi e Costi</CardTitle>
          <div className="space-x-2">
            <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Prefisso
            </Button>
            <Button variant="outline" onClick={resetToDefaults}>
              Ripristina Default
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prefisso</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrizione</TableHead>
              <TableHead>Costo/Min (€)</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prefixConfig.map((prefix) => (
              <TableRow key={prefix.prefix}>
                <TableCell className="font-mono">
                  {editingId === prefix.prefix ? (
                    <Input
                      value={prefix.prefix}
                      onChange={(e) => handleEdit(prefix, 'prefix', e.target.value)}
                      className="w-20"
                    />
                  ) : (
                    prefix.prefix
                  )}
                </TableCell>
                <TableCell>
                  {editingId === prefix.prefix ? (
                    <Select
                      value={prefix.category}
                      onValueChange={(value) => handleEdit(prefix, 'category', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="landline">Fisso</SelectItem>
                        <SelectItem value="special">Speciale</SelectItem>
                        <SelectItem value="unknown">Altro</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(prefix.category)}`}>
                      {prefix.description}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === prefix.prefix ? (
                    <Input
                      value={prefix.description}
                      onChange={(e) => handleEdit(prefix, 'description', e.target.value)}
                      className="w-32"
                    />
                  ) : (
                    prefix.description
                  )}
                </TableCell>
                <TableCell>
                  {editingId === prefix.prefix ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={prefix.costPerMinute}
                      onChange={(e) => handleEdit(prefix, 'costPerMinute', parseFloat(e.target.value))}
                      className="w-24"
                    />
                  ) : (
                    `€${prefix.costPerMinute.toFixed(2)}`
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {editingId === prefix.prefix ? (
                      <>
                        <Button size="sm" onClick={() => setEditingId(null)}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(prefix.prefix)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(prefix.prefix)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {isAdding && (
              <TableRow>
                <TableCell>
                  <Input
                    placeholder="Es: 800"
                    value={newPrefix.prefix || ''}
                    onChange={(e) => setNewPrefix({ ...newPrefix, prefix: e.target.value })}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={newPrefix.category}
                    onValueChange={(value) => setNewPrefix({ ...newPrefix, category: value as any })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="landline">Fisso</SelectItem>
                      <SelectItem value="special">Speciale</SelectItem>
                      <SelectItem value="unknown">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Descrizione"
                    value={newPrefix.description || ''}
                    onChange={(e) => setNewPrefix({ ...newPrefix, description: e.target.value })}
                    className="w-32"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newPrefix.costPerMinute || ''}
                    onChange={(e) => setNewPrefix({ ...newPrefix, costPerMinute: parseFloat(e.target.value) })}
                    className="w-24"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleAdd}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PrefixManager;
