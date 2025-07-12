package br.com.csaserigy.subcomite.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfigurations {

    @Autowired
    private SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(req -> {
                    // MUDANÇA IMPORTANTE AQUI
                    // Libera acesso público às rotas da API que não precisam de login
                    req.requestMatchers(HttpMethod.POST, "/login").permitAll();

                    // Libera acesso público a TODOS os seus arquivos estáticos (HTML, CSS, JS, etc)
                    req.requestMatchers("/**.html", "/**.css", "/**.js", "/**.png", "/**.jpg").permitAll();
                    req.requestMatchers("/").permitAll(); // Permite acesso à página raiz

                    // Deixa as rotas de consulta de produtos e contato públicas, como estava
                    req.requestMatchers(HttpMethod.GET, "/produtos").permitAll();
                    req.requestMatchers(HttpMethod.POST, "/pedidos").permitAll();
                    req.requestMatchers(HttpMethod.GET, "/admin/contato").permitAll();
                    req.requestMatchers(HttpMethod.GET, "/produtos/imagem/**").permitAll();

                    // Para todo o resto (ex: editar estoque, ver pedidos), exige autenticação
                    req.anyRequest().authenticated();
                })
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    // O resto do arquivo continua igual...
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOrigin("*");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}