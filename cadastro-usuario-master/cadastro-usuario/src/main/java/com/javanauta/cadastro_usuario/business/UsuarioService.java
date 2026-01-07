package com.javanauta.cadastro_usuario.business;

import com.javanauta.cadastro_usuario.infrastructure.entitys.Usuario;
import com.javanauta.cadastro_usuario.infrastructure.repository.UsuarioRepository;
import org.springframework.stereotype.Service;


@Service

public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;

    }
    public void salvarUsuario(Usuario usuario) {
        repository.saveAndFlush(usuario);
    }
    public Usuario buscarUsuarioporEmail(String email) {

        return repository.findByEmail(email).orElseThrow(
                () -> new RuntimeException("Email Não Encontrado")
        );
    }
    public void deletarUsuarioPorEmail(String email) {
        repository.deleteByEmail(email);
    }

    public void atualizarUsuarioPorID(Integer id, Usuario usuario) {
        Usuario usuarioEntity = repository.findById(id).orElseThrow(() -> new RuntimeException("Usuario Não Encontrado"));
        Usuario usuarioAtualizado = Usuario.builder()
                .email(usuario.getEmail() != null ? usuario.getEmail() : usuarioEntity.getEmail())
                .id(usuarioEntity.getId())
                .nome(usuario.getNome() != null ? usuario.getNome() : usuarioEntity.getNome())
                .build();
        repository.saveAndFlush(usuarioAtualizado);

    }
}


