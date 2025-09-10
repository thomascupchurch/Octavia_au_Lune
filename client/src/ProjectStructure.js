
import React, { useState } from 'react';

const today = () => new Date().toISOString().slice(0, 10);
const HIERARCHY = [
	{ type: 'phase', label: 'Phase' },
	{ type: 'feature', label: 'Feature' },
	{ type: 'job', label: 'Job' },
	{ type: 'item', label: 'Item' },
	{ type: 'milestone', label: 'Milestone' },
];
function createNode(type, name = '') {
	return {
			setStructure(structure => {
				function add(nodes) {
					return nodes.map(n => {
						if (n.id === parentId) {
							const type = HIERARCHY[childLevel]?.type || 'item';
							return { ...n, children: [...(n.children || []), createNode(type)] };
						}
						if (n.children) return { ...n, children: add(n.children) };
						return n;
					});
				}
				return add(structure);
			});
																</div>
																function renderTree(nodes, level) {
																	return (
																		<ul style={{ listStyle: 'none', paddingLeft: 20 }}>
																			{nodes.map(node => {
																				let nextTypeLabel = 'Item';
																				if (node.type === 'phase') nextTypeLabel = 'Feature';
																				else if (node.type === 'feature') nextTypeLabel = 'Job';
																				else if (node.type === 'job') nextTypeLabel = 'Item';
																				else if (node.type === 'item') nextTypeLabel = 'Milestone';
																				const isJob = node.type === 'job';
																				const isItem = node.type === 'item';
																				return (
																					<li key={node.id} style={{ marginBottom: 8 }}>
																						<input
																							value={node.name}
																							onChange={e => handleEdit(node.id, e.target.value, level)}
																							placeholder={node.type.charAt(0).toUpperCase() + node.type.slice(1)}
																							style={{ fontWeight: node.type === 'phase' ? 'bold' : 'normal', minWidth: 120 }}
																						/>
																						{isItem && collapsed[node.id] ? null : (node.type === 'item' || node.type === 'milestone') && (
																							<div>
																								<input type="date" value={node.start} onChange={e => handleItemPropChange(node.id, 'start', e.target.value)} style={{ marginLeft: 8 }} />
																								<input type="date" value={node.end} onChange={e => handleItemPropChange(node.id, 'end', e.target.value)} style={{ marginLeft: 4 }} />
																								{node.type === 'item' && (
																									<input type="number" min={0} max={100} value={node.progress} onChange={e => handleItemPropChange(node.id, 'progress', Number(e.target.value))} style={{ width: 50, marginLeft: 4 }} />
																								)}%
																								<select
																									multiple
																									value={Array.isArray(node.dependencies) ? node.dependencies : node.dependencies ? [node.dependencies] : []}
																									onChange={e => {
																										const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
																										handleItemPropChange(node.id, 'dependencies', selected);
																									}}
																									style={{ marginLeft: 8, minWidth: 120 }}
																								>
																									{allTasks.filter(t => t.id !== node.id).map(t => {
																										function getDescendantIds(nodes, id) {
																											let ids = [];
																											function walk(n) {
																												if (n.id === id) {
																													collect(n);
																												} else if (n.children) {
																													n.children.forEach(walk);
																												}
																											}
																											function collect(n) {
																												if (n.children) n.children.forEach(collect);
																												ids.push(n.id);
																											}
																											nodes.forEach(walk);
																											return ids;
																										}
																										const descendants = getDescendantIds(structure, node.id);
																										return (
																											<option key={t.id} value={t.id} disabled={descendants.includes(t.id)}>{t.name}{descendants.includes(t.id) ? ' (circular)' : ''}</option>
																										);
																									})}
																								</select>
																								<span style={{ fontSize: 12, color: '#888', marginLeft: 4 }}>
																									{Array.isArray(node.dependencies) && node.dependencies.length > 0 &&
																										`Depends on: ${allTasks.filter(t => node.dependencies.includes(t.id)).map(t => t.name).join(', ')}`}
																								</span>
																								<textarea
																									value={node.notes || ''}
																									onChange={e => handleItemPropChange(node.id, 'notes', e.target.value)}
																									placeholder="Notes..."
																									style={{ display: 'block', marginTop: 8, width: 300, minHeight: 40 }}
																								/>
																								<input
																									type="file"
																									multiple
																									onChange={e => {
																										const files = Array.from(e.target.files);
																										if (!files.length) return;
																										const formData = new FormData();
																										files.forEach(f => formData.append('files', f));
																										fetch('http://localhost:5000/api/upload', {
																											method: 'POST',
																											body: formData,
																										})
																											.then(res => res.json())
																											.then(data => {
																												if (data.success) {
																													const filenames = data.files.map(f => f.filename);
																													handleItemPropChange(node.id, 'attachments', [...(node.attachments || []), ...filenames]);
																												} else {
																													alert('Upload failed');
																												}
																											});
																									}}
																									style={{ display: 'block', marginTop: 8 }}
																								/>
																								{Array.isArray(node.attachments) && node.attachments.length > 0 && (
																									<div style={{ marginTop: 4 }}>
																										<span style={{ fontSize: 12, color: '#888' }}>Attachments: </span>
																										{node.attachments.map((file, i) => {
																											const url = `http://localhost:5000/uploads/${file}`;
																											const isImage = /\.(jpe?g|png|gif|bmp|svg)$/i.test(file);
																											return isImage ? (
																												<a
																													key={file + i}
																													href={url}
																													target="_blank"
																													rel="noopener noreferrer"
																													style={{ marginRight: 8, display: 'inline-block', verticalAlign: 'middle' }}
																												>
																													<img src={url} alt={file} style={{ maxWidth: 60, maxHeight: 60, border: '1px solid #ccc', borderRadius: 4, marginRight: 2, verticalAlign: 'middle' }} />
																												</a>
																											) : (
																												<a
																													key={file + i}
																													href={url}
																													target="_blank"
																													rel="noopener noreferrer"
																													style={{ marginRight: 8, fontSize: 12 }}
																												>
																													{file}
																												</a>
																											);
																										})}
																									</div>
																								)}
																							</div>
																						)}
																						{isJob && (
																							<button onClick={() => handleAdd(node.id, level + 1)} style={{ marginLeft: 8 }}>+Item</button>
																						)}
																						{!isJob && level < HIERARCHY.length - 2 && (
																							<button onClick={() => handleAdd(node.id, level)} style={{ marginLeft: 8 }}>+{nextTypeLabel}</button>
																						)}
																						{isItem && !collapsed[node.id] && (
																							<button onClick={() => setCollapsed(c => ({ ...c, [node.id]: true }))} style={{ marginLeft: 8, color: '#4B4B4B' }}>Done</button>
																						)}
																						{isItem && collapsed[node.id] && (
																							<button onClick={() => setCollapsed(c => ({ ...c, [node.id]: false }))} style={{ marginLeft: 8, color: '#FF8200' }}>Edit</button>
																						)}
																						{node.type !== 'milestone' && (
																							<button onClick={() => handleAdd(node.id, HIERARCHY.length - 2)} style={{ marginLeft: 8, color: '#FF8200', borderColor: '#FF8200' }}>+Milestone</button>
																						)}
																						<button onClick={() => handleDelete(node.id, level)} style={{ color: 'red', marginLeft: 8 }}>Delete</button>
																						{(!isItem || !collapsed[node.id]) && node.children && node.children.length > 0 &&
																							renderTree(node.children, level + 1)}
																					</li>
																				);
																			})}
																		</ul>
																	);
																}

																return (
																	<div>
																		{renderTree(structure, 0)}
																	</div>
																);
															}

															export default ProjectStructure;
													{isJob && (
														<button onClick={() => handleAdd(node.id, level + 1)} style={{ marginLeft: 8 }}>+Item</button>
													)}
													{!isJob && level < HIERARCHY.length - 2 && (
														<button onClick={() => handleAdd(node.id, level)} style={{ marginLeft: 8 }}>+{nextTypeLabel}</button>
													)}
													{isItem && !collapsed[node.id] && (
														<button onClick={() => setCollapsed(c => ({ ...c, [node.id]: true }))} style={{ marginLeft: 8, color: '#4B4B4B' }}>Done</button>
													)}
													{isItem && collapsed[node.id] && (
														<button onClick={() => setCollapsed(c => ({ ...c, [node.id]: false }))} style={{ marginLeft: 8, color: '#FF8200' }}>Edit</button>
													)}
													{node.type !== 'milestone' && (
														<button onClick={() => handleAdd(node.id, HIERARCHY.length - 2)} style={{ marginLeft: 8, color: '#FF8200', borderColor: '#FF8200' }}>+Milestone</button>
													)}
													<button onClick={() => handleDelete(node.id, level)} style={{ color: 'red', marginLeft: 8 }}>Delete</button>
													{(!isItem || !collapsed[node.id]) && node.children && node.children.length > 0 &&
														renderTree(node.children, level + 1)}
												</li>
											);
										})}
									</ul>
								);
							}

							return (
								<div>
									{renderTree(structure, 0)}
								</div>
							);
						};

